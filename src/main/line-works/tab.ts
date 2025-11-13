import { UserChannelListItem, UserInfo } from '.'
import { DebuggerMethod, IM_TYPE, MessageTypeCode } from '../../model'
import { SendMsgParams, Tab } from '../../model/type'
import { FetchOptions, fetchWithRetry } from '../fetcher'
import { TabInstance } from '../base-tab'
import _ from 'lodash'
import { tabEventBus, TabEvents } from '../event-bus'
import { findChangedKey, findUrlInfo, mergeUnique, parseJsonString } from '../utils'
import {
  automaticApiKeys,
  automaticOmitApiKeys,
  syncUserChannelListCompareFields,
  forwardInterfaceKeys,
  URLS_MAP,
  userOptionsParams,
  cookieKeys
} from './constance'
import { HTTP_STATUS_CODE } from '../../model/api.constant'
import { genContentMsg, genHeaders, genMediaMsg, getMessageType } from './utils'
import { SocketEvent } from '../../model/common.constant'

type URLS_MAP_TYPE = typeof URLS_MAP

export class LineWorksTab extends TabInstance {
  protected tabType = IM_TYPE.LineWorks
  protected userId?: string | undefined
  private cookies: { name: string; value: string }[] = []
  private _requestHostMap: Partial<Record<keyof URLS_MAP_TYPE, any>> = {}
  private set requestHostMap(requestHostMap) {
    const diffKey = findChangedKey(this._requestHostMap, requestHostMap, automaticOmitApiKeys)
    if (diffKey && automaticApiKeys.includes(diffKey)) {
      const request = _.get(requestHostMap, diffKey)?.request
      this[diffKey]?.(request)
    }
    this._requestHostMap = requestHostMap
  }
  private get requestHostMap() {
    return this._requestHostMap
  }
  private userInfo: UserInfo = {} as UserInfo
  private lastChannelItem?: UserChannelListItem
  constructor(tab: Tab) {
    super(tab)
  }
  onAuthInfoByUrl(url: string): Promise<Record<string, string>> {
    return this.view.webContents.debugger
      .sendCommand('Network.getCookies', { urls: [url] })
      .then((data) => {
        const cookie = _.get(data, 'cookies')
          ?.map((cookie) => `${cookie.name}=${cookie.value}`)
          .join(';')
        return { cookie }
      })
      .catch(() => ({}))
  }
  updateCookies(associatedCookies: Array<{ cookie: { name: string; value: string } }>) {
    const { cookies: _cookies = [] } = this
    const cookies = associatedCookies.map((item) => item.cookie)
    this.cookies = mergeUnique(_cookies, cookies, 'name')
  }
  get cookieString(): string {
    return _.chain(cookieKeys)
      .map((key) => {
        const { value } = _.find(this.cookies, { name: key })
        return value ? `${key}=${value}` : null
      })
      .compact()
      .join(';')
      .value()
  }
  onDebuggerMessageHandler() {
    return (_: Electron.Event, method: string, params: any) => {
      if (method === DebuggerMethod.RequestWillBeSent) {
        const url = params.request?.url
        const { requestHostMap } = this
        const { key } = findUrlInfo<URLS_MAP_TYPE>(url, URLS_MAP)
        if (key && !requestHostMap[key] && automaticApiKeys.includes(key)) {
          this.requestHostMap = { ...requestHostMap, [key]: params }
        }
        this.requestWillBeSent(params)
      }
      if (method === DebuggerMethod.RequestWillBeSentExtraInfo) {
        this.updateCookies(params.associatedCookies)
      }
    }
  }
  private requestWillBeSent(params: any) {
    const { request } = params
    const { key: apiKey } = findUrlInfo<URLS_MAP_TYPE>(request.url, URLS_MAP)
    if (apiKey && forwardInterfaceKeys.includes(apiKey)) {
      this[apiKey]?.(request)
    }
  }
  private async generateRequestArguments(request: any): Promise<{
    url: string
    options: FetchOptions
  }> {
    const { url, method, headers: _headers, postData, hasPostData } = request ?? {}
    const auth = url ? await this.onAuthInfoByUrl(url) : {}
    const headers = { ..._headers, ...auth }
    const options = { headers, method }
    if (hasPostData) Object.assign(options, { body: postData })
    return { url, options }
  }
  private async getUserInfo(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (data && !err) {
      this.userInfo = _.merge(this.userInfo, data)
      const {
        contactNo,
        name: { displayName: userName }
      } = this.userInfo
      const userId = (this.userId = String(contactNo || ''))
      this.updateTabUser({ userId, userName, from: IM_TYPE.LineWorks })
      this.onUserStatus(true)
    }
  }
  private async syncUserChannelList(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (!err && data) {
      const items = _.get(data, 'result') as UserChannelListItem[]
      for (const item of items) {
        if (
          !_.isEqual(
            _.pick(item, syncUserChannelListCompareFields),
            _.pick(this.lastChannelItem, syncUserChannelListCompareFields)
          )
        ) {
          this.lastChannelItem = item
          if (String(this.userId) !== String(item.userNo)) {
            const { content, extras, messageTypeCode } = item
            const parsedExtras = parseJsonString(extras)
            const notify: Electron.NotificationConstructorOptions = {
              title: item.title,
              body: getMessageType(messageTypeCode, content, parsedExtras),
              hasReply: false
            }
            const onClick = () => tabEventBus.emit(TabEvents.NotifyClicked, this.uuid, this.bounds)
            this.onNotify(notify, onClick)
          }
          const payload = {
            tabId: this.uuid,
            userId: this.userId,
            data: item
          }
          this.emitMsgFromMainToRender(SocketEvent.ForwardMessage, payload)
        }
      }
    }
  }
  private async getUserChannelListByType(request: any) {
    const userOptionsRequest = this.requestHostMap.setUserOptions?.request
    const { url, options } = await this.generateRequestArguments(userOptionsRequest)
    if (url && options) {
      Object.assign(options, { body: userOptionsParams })
      const [err, data] = await fetchWithRetry(url, options)
      if (data?.code === HTTP_STATUS_CODE.Success && !err) {
        const { url, options } = await this.generateRequestArguments(request)
        Object.assign(options, { body: JSON.stringify({ beforeMsgTime: 0, pagingCount: 100000 }) })
        const [err, channeldata] = await fetchWithRetry(url, options)
        if (!err && channeldata?.code === HTTP_STATUS_CODE.Success) {
          const mergedList = _.flatMap(_.get(channeldata, 'result'), 'channelList')
          const uniqueList = _.uniqBy(mergedList, 'channelNo')
          const payload = {
            userList: uniqueList,
            tabId: this.uuid,
            userId: this.userId
          }
          this.emitMsgFromMainToRender(SocketEvent.UpdateUserList, payload)
        }
      }
    }
  }
  protected async onUserStatus(isOnline: boolean) {
    const payload = {
      ...this.userInfo,
      tabId: this.uuid,
      isOnline: !!isOnline
    }
    this.emitMsgFromMainToRender(SocketEvent.UpdateUserStatus, payload)
  }
  private async onSendMsgFunc(url, payload) {
    const body = JSON.stringify(payload)
    const contentLength = String(Buffer.byteLength(body, 'utf8'))
    const options: FetchOptions = {
      method: 'POST',
      headers: genHeaders({ cookie: this.cookieString, 'Content-Length': contentLength }),
      body
    }
    this.workerRequest({ url, options })
  }
  onSendMessage(params: SendMsgParams) {
    const { type, userId } = params
    if (userId !== this.userId) return
    if ([MessageTypeCode.Text, MessageTypeCode.Stk].includes(type)) {
      const { url, payload } = genContentMsg(params)
      this.onSendMsgFunc(url, payload)
    }
    if ([MessageTypeCode.Image, MessageTypeCode.File].includes(type)) {
      const { url, payload } = genMediaMsg(params)
      this.onSendMsgFunc(url, payload)
    }
  }
}

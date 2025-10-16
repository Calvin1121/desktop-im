import { UserChannelListItem, UserInfo, SendMsg } from '.'
import { DebuggerMethod, IM_TYPE } from '../../model'
import { Tab } from '../../model/type'
import { FetchOptions, fetchWithRetry } from '../fetcher'
import { TabInstance } from '../base-tab'
import _ from 'lodash'
import { apis, baseUrl } from '../../api'
import { tabEventBus, TabEvents } from '../event-bus'
import { findChangedKey, findUrlInfo, genTempId, parseJsonString } from '../utils'
import {
  automaticApiKeys,
  MessageTypeCode,
  automaticOmitApiKeys,
  syncUserChannelListCompareFields,
  forwardInterfaceKeys,
  URLS_MAP,
  userOptionsParams
} from './constance'
import { HTTP_STATUS_CODE } from '../../model/api.constance'
import { getMessageType } from './utils'

type URLS_MAP_TYPE = typeof URLS_MAP

export class LineWorksTab extends TabInstance {
  private globalHeaders: FetchOptions['headers'] = {}
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
  private channelMap: Map<number, UserChannelListItem> = new Map()
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
    }
  }
  private async onForwardData(params) {
    const url = `${baseUrl}${apis.webhookLinework}`
    const payload = { wssPayload: params }
    const options = { body: JSON.stringify(payload), method: 'POST' }
    this.forwardPayload({ url, options })
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
    this.globalHeaders = headers
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
        contactNo: userId = '',
        name: { displayName: userName }
      } = this.userInfo
      this.updateTabUser({ userId: String(userId), userName, from: IM_TYPE.LineWorks })
    }
  }
  private get selfUserId(): string {
    return String(this.userInfo?.contactNo || '')
  }
  private async syncUserChannelList(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (!err && data) {
      const items = _.get(data, 'result') as UserChannelListItem[]
      for (const item of items) {
        const channelNo = item.channelNo
        const lastItem = this.channelMap.get(channelNo)
        if (
          !_.isEqual(
            _.pick(item, syncUserChannelListCompareFields),
            _.pick(lastItem, syncUserChannelListCompareFields)
          )
        ) {
          this.channelMap.set(channelNo, item)
          if (String(this.selfUserId) !== String(item.userNo)) {
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
          this.onForwardData(item)
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
          console.log(uniqueList)
          this.onForwardData(uniqueList)
        }
      }
    }
  }
  private onSendContentMsg(payload: any) {
    // TODO
  }
  private onSendMediaMsg(payload: any) {
    // TODO
  }
  onSendMessage(sendMsg: SendMsg) {
    const { content, channelNo, domainId, extras, type, filename, filesize, channelType } = sendMsg
    const userNo = this.selfUserId
    if ([MessageTypeCode.Text, MessageTypeCode.Stk].includes(type)) {
      const payload = {
        serviceId: 'works',
        channelNo,
        tempMessageId: genTempId(),
        caller: { domainId, userNo },
        extras,
        content,
        msgTid: genTempId(),
        type
      }
      this.onSendContentMsg(payload)
    }
    if ([MessageTypeCode.Image, MessageTypeCode.File].includes(type)) {
      const payload = {
        serviceId: 'works',
        filename,
        filesize,
        channelNo,
        msgType: type,
        channelType
      }
      this.onSendMediaMsg(payload)
    }
  }
}

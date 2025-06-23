import { UserChannelListItem, UserInfo } from '.'
import { DebuggerMethod, IM_TYPE } from '../../model'
import { Tab } from '../../model/type'
import { fetchWithRetry } from '../fetcher'
import { TabInstance } from '../base-tab'
import _ from 'lodash'
import { apis, baseUrl } from '../../api'
import { Notification } from 'electron'

export class LineWorksTab extends TabInstance {
  private readonly userInfoUrl = 'contacts/my'
  private readonly syncUserChannelListUrl = 'client/chat/syncUserChannelList'
  private userInfo: UserInfo = {} as UserInfo
  private channelMap: Map<number, UserChannelListItem> = new Map()
  forwardCount = 0
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
        this.requestWillBeSent(params)
      }
    }
  }
  private async onForwardData(params) {
    const url = `${baseUrl}${apis.webhookLinework}`
    // const wssPayload = params.response?.payloadData
    const payload = { wssPayload: params }
    const options = { body: JSON.stringify(payload), method: 'POST' }
    // const base64WssPayload = parseBase64(wssPayload)
    // const parsedWssPayload = parseJsonString(base64WssPayload)
    // console.info(parsedWssPayload)
    // if (parsedWssPayload) {
    //   if (_.get(parsedWssPayload, 'notification-id')) {
    //     const sender = _.get(parsedWssPayload, 'loc-args0')
    //     const contentType = _.get(parsedWssPayload, 'loc-key')
    //     const content =
    //       contentType === 'REV_MSG' ? _.get(parsedWssPayload, 'loc-args1') : `[非文本消息]`
    //     return { sender, content }
    //   }
    this.forwardPayload({ url, options })
    // }
  }
  private requestWillBeSent(params: any) {
    const { request } = params
    const { url } = request
    if (url.includes(this.userInfoUrl)) {
      this.getUserInfo(request)
    }
    if (url.includes(this.syncUserChannelListUrl)) {
      this.syncUserChannelList(request)
    }
  }
  private async generateRequestArguments(request: any) {
    const { url, method, headers, postData, hasPostData } = request
    const auth = await this.onAuthInfoByUrl(url)
    const options = { headers: { ...headers, ...auth }, method }
    if (hasPostData) Object.assign(options, { body: postData })
    return { url, options }
  }
  private async getUserInfo(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (data && !err) {
      this.userInfo = _.merge(this.userInfo, data)
      const {
        contactNo: userId,
        name: { displayName: userName }
      } = this.userInfo
      this.updateTabUser({ userId, userName, from: IM_TYPE.LineWorks })
    }
  }
  private async syncUserChannelList(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (!err && data) {
      const items = _.get(data, 'result') as UserChannelListItem[]
      const compareFields = ['channelNo', 'messageTime', 'messageNo', 'lastMessageNo', 'userNo']
      for (const item of items) {
        const channelNo = item.channelNo
        const lastItem = this.channelMap.get(channelNo)
        if (!_.isEqual(_.pick(item, compareFields), _.pick(lastItem, compareFields))) {
          this.channelMap.set(channelNo, item)
          // const notify = {}
          // this.onNotify(notify)
          this.onForwardData(item)
        }
      }
    }
  }
}

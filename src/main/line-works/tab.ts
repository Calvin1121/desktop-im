import { UserInfo, UserListItem } from '.'
import { DebuggerMethod, IM_TYPE } from '../../model'
import { Tab } from '../../model/type'
import { fetchWithRetry } from '../fetcher'
import { TabInstance } from '../base-tab'
import _ from 'lodash'
import { apis, baseUrl } from '../../api'

export class LineWorksTab extends TabInstance {
  private readonly userInfoUrl = 'contacts/my'
  private readonly userListUrl = 'chat/getVisibleUserChannelList'
  private userInfo: UserInfo = {} as UserInfo
  private userList: UserListItem[] = []
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
      if (method === DebuggerMethod.WebSocketFrameReceived) {
        this.onForwardWssData(params)
      }
    }
  }
  private async onForwardWssData(params) {
    const url = `${baseUrl}${apis.webhookLinework}`
    const wssPayload = params.response?.payloadData
    const payload = {
      wssFrame: wssPayload,
      user: this.userInfo,
      userList: this.userList
    }
    const options = { body: JSON.stringify(payload), method: 'POST' }
    this.postWssPayload({ url, options })
  }
  private requestWillBeSent(params: any) {
    const { request } = params
    const { url } = request
    if (url.includes(this.userInfoUrl)) {
      this.getUserInfo(request)
    }
    if (url.includes(this.userListUrl)) {
      let payload
      try {
        payload = JSON.parse(request.postData)
      } catch (err) {
        console.error(err)
      }
      if (!payload.isPin) this.getUserList(request)
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
  private async getUserList(request: any) {
    const { url, options } = await this.generateRequestArguments(request)
    const [err, data] = await fetchWithRetry(url, options)
    if (data && !err) {
      const _userList = [...this.userList]
      const userList = _.get(data, 'result')?.filter((item) => !!item.userList?.length)
      this.userList = _.uniqBy([..._userList, ...userList], 'userNo')
    }
  }
}

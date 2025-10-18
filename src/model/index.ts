export enum IM_TYPE {
  Wechat = 'wechat',
  DTalk = 'dtalk',
  Zerak = 'zerak',
  LineWorks = 'line_works'
}
export const BASE_IM_LIST = [
  { name: '微信', key: IM_TYPE.Wechat, icon: '💬', url: 'https://wx.qq.com/' },
  { name: '钉钉', key: IM_TYPE.DTalk, icon: '📎', url: 'https://im.dingtalk.com/' },
  { name: '飞书', key: IM_TYPE.Zerak, icon: '🕊️', url: 'https://www.feishu.cn/' },
  {
    name: 'Line Works',
    key: IM_TYPE.LineWorks,
    icon: '📞',
    url: 'https://talk.worksmobile.com/',
    index:
      'https://auth.worksmobile.com/login/login?accessUrl=https%3A%2F%2Fcommon.worksmobile.com%2Fproxy%2Fmy&isRefreshed=true'
  }
]

export enum DebuggerMethod {
  RequestWillBeSent = 'Network.requestWillBeSent',
  WebSocketFrameReceived = 'Network.webSocketFrameReceived',
  ResponseReceived = 'Network.responseReceived',
  RequestWillBeSentExtraInfo = 'Network.requestWillBeSentExtraInfo'
}

export enum MessageTypeCode {
  Text = 1,
  VoiceCall = 2,
  ContactPoint = 3,
  Address = 4,
  Image = 11,
  File = 16,
  Stk = 18,
  Task = 25,
  Survey = 27,
  Template = 29,
  VoiceMsg = 39
}

export const MAX_TAB = 10

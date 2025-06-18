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
    url: 'https://auth.worksmobile.com/login/login?accessUrl=https%3A%2F%2Fcommon.worksmobile.com%2Fproxy%2Fmy&isRefreshed=true'
  }
]

export enum DebuggerMethod {
  RequestWillBeSent = 'Network.requestWillBeSent',
  WebSocketFrameReceived = 'Network.webSocketFrameReceived'
}

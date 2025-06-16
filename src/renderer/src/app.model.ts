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
    name: 'Line',
    key: IM_TYPE.LineWorks,
    icon: '📞',
    url: 'https://auth.worksmobile.com/login/login'
  }
]
export const LINE_WORKS_API = {
  // channelInfo: { urlKey: 'client/chat/getChannelInfo' }
  meApi: { urlKey: 'domain/contacts/my' },
  usersApi: {
    dataKey: 'result',
    urlKey: 'chat/getVisibleUserChannelList'
  }
}

export const API_MAP = {
  [IM_TYPE.LineWorks]: LINE_WORKS_API
}

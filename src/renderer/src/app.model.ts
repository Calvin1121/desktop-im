export const BASE_IM_LIST = [
  { name: '微信', key: 'wechat', icon: '💬', url: 'https://wx.qq.com/' },
  { name: '钉钉', key: 'dtalk', icon: '📎', url: 'https://im.dingtalk.com/' },
  { name: '飞书', key: 'zerak', icon: '🕊️', url: 'https://www.feishu.cn/' },
  { name: 'Line', key: 'line_works', icon: '📞', url: 'https://auth.worksmobile.com/login/login' }
]
const LINE_AUTH = (data): void => {
  const authFields = ['language', ' LC', ' WORKS_RE_LOC', ' WORKS_TE_LOC', ' WORKS_LOGIN_TYPE', ' timezone', ' TZ', ' NEO_SES', ' WORKS_USER_DOMAIN', ' WORKS_USER_ID', ' WORKS_JOIN_LOC', ' NEO_CHK', ' _ga_02PY6WYJV6', ' _ga', ' _gid', ' _gat_UA-217420925-5', ' WORKS_SES', ' org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE']
  console.info(data)
}
export const LINE_WORKS_API = {
  channelInfo: { urlKey: 'client/chat/getChannelInfo' }
  // meApi: { urlKey: 'domain/contacts/my', onAuth: LINE_AUTH },
  // usersApi: {
  //   dataKey: 'result',
  //   urlKey: 'chat/getVisibleUserChannelList',
  //   payloadFilter: { isPin: true },
  //   onAuth: LINE_AUTH
  // }
}

export const API_MAP = {
  line_works: LINE_WORKS_API
}

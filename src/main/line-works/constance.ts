export const URLS_MAP = {
  getUserInfo: 'p/contact/v3/domain/contacts/my',
  syncUserChannelList: 'client/chat/syncUserChannelList',
  setUserOptions: 'p/oneapp/client/api/setUserOptions',
  getUserChannelListByType: 'p/oneapp/client/chat/getUserChannelListByType',
  sendMessage: 'p/oneapp/client/chat/sendMessage',
  issueResourcePath: 'p/oneapp/client/chat/issueResourcePath'
}

export const syncUserChannelListCompareFields = [
  'channelNo',
  'messageTime',
  'messageNo',
  'lastMessageNo',
  'userNo'
]

export const forwardInterfaceKeys: Array<keyof typeof URLS_MAP> = [
  'getUserInfo',
  'syncUserChannelList'
]

export const automaticOmitApiKeys: Array<keyof typeof URLS_MAP> = [
  'getUserInfo',
  'syncUserChannelList'
]

export const automaticApiKeys: Array<keyof typeof URLS_MAP> = [
  'setUserOptions',
  'getUserChannelListByType'
]

export const userOptionsParams =
  'payload={"userOptions":[{"optionName":"global_search_sort_type","optionValue":"time"}]}'

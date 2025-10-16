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

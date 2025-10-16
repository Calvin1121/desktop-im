export interface UserInfo {
  tenantId: number
  domainId: number
  contactNo: number
  readOnly: boolean
  tempId: boolean
  name: Name
  i18nName: string
  i18nNames: any[]
  photos: any[]
  organizations: Organization[]
  emails: Email[]
  telephones: any[]
  messengers: any[]
  position: string
  department: string
  important: boolean
  executive: boolean
  photoHash: string
  worksAt: WorksAt
  accessLimit: boolean
  userPhotoModify: boolean
  userAbsenceModify: boolean
  organization: string
  groups: any[]
  worksServices: string[]
  customFields: any[]
  profileStatuses: any[]
  profileStatusesV2: any[]
  instance: number
}

export interface Name {
  firstName: string
  lastName: string
  phoneticFirstName: string
  phoneticLastName: string
  displayName: string
  phoneticName: string
}

export interface Organization {
  domainId: number
  organization: string
  groups: any[]
}

export interface Email {
  content: string
  typeCode: string
  represent: boolean
}

export interface WorksAt {
  id: string
  inviteUrl: string
  users: any[][]
  worksAtCount: number
  idSearchBlock: boolean
}

export interface UserChannelListItem {
  channelNo: number
  channelType: number
  userCount: number
  botCount: number
  visible: boolean
  joined: boolean
  periodMin: number
  updateTime: number
  unreadCount: number
  starredThreadCount: number
  firstMessageNo: number
  title: string
  messageTime: number
  messageNo: number
  lastMessageNo: number
  userNo: number
  userFirstMsgNo: number
  userLastMsgNo: number
  content: string
  messageTypeCode: number
  extras: string
  channelExtras: string
  photoPath: string
  silentMode: number
  pin: boolean
  flag: number
  messageStatusType: string
  userList: UserListItem[]
  botList: any[]
  updatedMsgNoList: any[]
  recalledNotiIdList: any[]
}

export interface UserListItem {
  userNo: number
  name: string
  i18nName: string
  i18nNames: I18nNames
  nickName: string
  position: string
  i18nPositions?: I18nPositions
  groupName: string
  i18nGroupNames: any
  groupPosition: string
  i18nGroupPositions: any
  photoHash: string
  join: boolean
  joinTime: number
  updateTime: number
  domainId: number
  propertyFlag: number
  domainName: string
  i18nDomainNames: I18nDomainNames
  serviceType: string
  relationStatus: string
  tenantId: number
  mappingContactNos: number[]
  guest: boolean
}

export interface I18nNames {}

export interface I18nPositions {}

export interface I18nDomainNames {}

export interface SendMsg {
  channelNo: number
  domainId?: number
  userNo?: number
  extras?: string
  content?: string
  type: MessageTypeCode
  filename?: string
  filesize?: string
  channelType?: number
}

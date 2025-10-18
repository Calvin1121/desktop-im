import { IM_TYPE } from '@renderer/app.model'
import { MessageTypeCode } from './index'

export interface Tab {
  name?: string
  uuid: string
  url: string
  index?: string
  key?: IM_TYPE
  loading?: boolean
  user?: TabUser
  loaded?: boolean
}
export interface Bounds {
  width: number
  height: number
  x: number
  y: number
}

export interface TabUser {
  userId: string
  userName: string
  from: IM_TYPE
}

export interface SendMsgParams {
  from: IM_TYPE
  channelNo: number
  domainId?: number
  userId?: number
  extras?: string
  content?: string
  type: MessageTypeCode
  filename?: string
  filesize?: string
  channelType?: number
}

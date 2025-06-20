import { IM_TYPE } from '@renderer/app.model'

export interface Tab {
  name?: string
  uuid: string
  url: string
  key?: IM_TYPE
  loading?: boolean
  user?: TabUser
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

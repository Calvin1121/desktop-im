import { IM_TYPE } from '@renderer/app.model'

export interface Tab {
  name?: string
  uuid: string
  url: string
  key?: IM_TYPE
  onAuth?: (data: Record<string, any>) => any
}
export interface Bounds {
  width: number
  height: number
  x: number
  y: number
}

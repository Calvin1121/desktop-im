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
  isPanelVisible?: boolean
  isRefreshing?: boolean
  currentTool?: string
  configMap?: Record<string, any>
}
export interface Bounds {
  width: number
  height: number
  x: number
  y: number
}

export interface IPInfo {
  ip: string
  network: string
  version: string
  city: string
  region: string
  region_code: string
  country: string
  country_name: string
  country_code: string
  country_code_iso3: string
  country_capital: string
  country_tld: string
  continent_code: string
  in_eu: boolean
  postal: any
  latitude: number
  longitude: number
  timezone: string
  utc_offset: string
  country_calling_code: string
  currency: string
  currency_name: string
  languages: string
  country_area: number
  country_population: number
  asn: string
  org: string
}

export interface IProxyTabConfig {
  ip: string
  timezone: string
  city: string
  country: string
  agent: string
  name: string
  system?: string[]
  serve: boolean
  select: string
  value: string[]
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

import { EventEmitter } from 'events'

export const tabEventBus = new EventEmitter()

export const TabEvents = {
  TabUser: 'tab:user'
} as const

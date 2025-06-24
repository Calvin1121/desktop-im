import { EventEmitter } from 'events'

export const tabEventBus = new EventEmitter()

export const TabEvents = {
  TabUser: 'tab:user',
  NotifyClicked: 'notify:clicked'
} as const

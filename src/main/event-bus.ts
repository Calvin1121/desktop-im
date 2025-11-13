import { EventEmitter } from 'events'

export const tabEventBus = new EventEmitter()

export const TabEvents = {
  TabUser: 'tab:user',
  NotifyClicked: 'notify:clicked',
  WorkerResult: 'worker:result',
  ForwardMsg: 'tab:forwardMsg'
} as const

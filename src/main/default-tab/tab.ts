import { Tab } from '../../model/type'
import { TabInstance } from '../base-tab'

export class DefaultTab extends TabInstance {
  constructor(tab: Tab) {
    super(tab)
  }
  protected tabType = ''
  protected userId = ''
  protected onAuthInfoByUrl() {
    return Promise.resolve({})
  }
  protected onDebuggerMessageHandler(): (
    event: Electron.Event,
    method: string,
    params: any
  ) => void {
    throw new Error('Method onDebuggerMessageHandler not implemented.')
  }
  protected onSendMessage() {
    throw new Error('Method onSendMessage not implemented.')
  }
  protected async onUserStatus() {
    throw new Error('Method onUserStatus not implemented.')
  }
}

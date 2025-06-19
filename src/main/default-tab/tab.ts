import { Tab } from '../../model/type'
import { TabInstance } from '../base-tab'

export class DefaultTab extends TabInstance {
  constructor(tab: Tab) {
    super(tab)
  }
  protected onAuthInfoByUrl() {
    return Promise.resolve({})
  }
  protected onDebuggerMessageHandler(): (
    event: Electron.Event,
    method: string,
    params: any
  ) => void {
    return () => {}
  }
}

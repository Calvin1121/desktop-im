import React from 'react'
import { ToolType } from './index.constant'
import TabProxy from './tabProxy'
import _ from 'lodash'

interface Props {
  tabState?: Partial<Tab>
  onCancel: () => void
  onConfirm: (config: Record<string, any>, toolType?: ToolType, isManual?: boolean) => void
}
const ToolPanel: React.FC<Props> = React.memo((props: Props) => {
  const { tabState = {}, onConfirm, onCancel } = props
  const { toolType, configMap = {} } = tabState
  return (
    <TabProxy
      config={_.get(configMap, ToolType.onSetTabProxy)}
      onConfirm={(config, isManual) => onConfirm(config, toolType, isManual)}
      onCancel={onCancel}
    />
  )
})
ToolPanel.displayName = 'ToolPanel'
export default ToolPanel

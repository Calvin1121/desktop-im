import React from 'react'
import { ToolType } from './index.constant'
import TabProxy from './tabProxy'
import _ from 'lodash'

interface Props {
  toolType?: ToolType
  tabState?: Partial<Tab>
  onCancel: () => void
  onConfirm: (config: Record<string, any>, toolType?: ToolType, isManual?: boolean) => void
}
const ToolPanel: React.FC<Props> = React.memo((props: Props) => {
  const { toolType, tabState = {}, onConfirm, onCancel } = props
  const { configMap = {} } = tabState
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

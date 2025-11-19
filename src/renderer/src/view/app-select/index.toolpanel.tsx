import React from 'react'
import { ToolType } from './index.constant'
import TabProxy from './tabProxy'
import { ConfigMap } from 'src/model/type'
import _ from 'lodash'

interface Props {
  toolType?: ToolType
  configMap?: ConfigMap
  onCancel: () => void
  onConfirm: (config: Record<string, any>, toolType?: ToolType, isManual?: boolean) => void
}
const ToolPanel: React.FC<Props> = React.memo((props: Props) => {
  const { toolType, configMap, onConfirm, onCancel } = props
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

import React, { useMemo } from 'react'
import { ToolType } from './index.constant'
import TabProxy from './tabProxy'
import _ from 'lodash'

interface Props {
  tab: Tab
  onCancel: () => void
  onConfirm: (config: Record<string, any>, toolType?: ToolType, isManual?: boolean) => void
}
const ToolPanel: React.FC<Props> = React.memo((props: Props) => {
  const { tab, onConfirm, onCancel } = props
  const toolType = useMemo(() => tab.toolType as ToolType, [tab.toolType])
  const configMap = useMemo(() => tab.configMap ?? {}, [tab.configMap])
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

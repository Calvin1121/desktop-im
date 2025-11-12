import React, { useMemo } from 'react'
import { ToolCallback } from './index.constant'
import TabProxy from './tabProxy'
import _ from 'lodash'

interface Props {
  tab: Tab
  onCancel: () => void
  onConfirm: (config: Record<string, any>, currentTool?: ToolCallback, isManual?: boolean) => void
}
const ToolPanel: React.FC<Props> = React.memo((props: Props) => {
  const { tab, onConfirm, onCancel } = props
  const currentTool = useMemo(() => tab.currentTool as ToolCallback, [tab.currentTool])
  const configMap = useMemo(() => tab.configMap ?? {}, [tab.configMap])
  return (
    <TabProxy
      config={_.get(configMap, ToolCallback.onSetTabProxy)}
      onConfirm={(config, isManual) => onConfirm(config, currentTool, isManual)}
      onCancel={onCancel}
    />
  )
})
ToolPanel.displayName = 'ToolPanel'
export default ToolPanel

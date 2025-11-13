import cn from '@renderer/utils/classname'
import styles from './index.module.scss'
import React, { useMemo } from 'react'
import { ACTIVE_TOOL_COLOR, TOOL_CONFIG, ToolType } from './index.constant'

interface Props {
  tab: Tab
  onTapToolCallback: (callback: ToolType) => void
}
const ToolBar: React.FC<Props> = React.memo((props: Props) => {
  const { tab, onTapToolCallback } = props
  const toolType = useMemo(() => tab.toolType, [tab.toolType])
  const onTapTool = (callback: ToolType) => {
    onTapToolCallback(callback)
  }
  if (tab?.uuid) {
    return (
      <div className={cn(styles.toolBlock)}>
        {tab.url && (
          <React.Fragment>
            {TOOL_CONFIG.map((tool) => {
              const color =
                tool.callback === toolType && tab.isPanelVisible ? ACTIVE_TOOL_COLOR : ''
              const isRefresh = tool.callback === ToolType.onTabRefresh
              const isDisabled = isRefresh && (!tab.loaded || tab.isRefreshing)
              return (
                <div
                  onClick={() => (isDisabled ? null : onTapTool(tool.callback))}
                  className={cn(isDisabled ? 'cursor-not-allowed opacity-25' : 'cursor-pointer')}
                  title={tool.label}
                  key={tool.callback}
                >
                  {tool.icon instanceof Function ? tool.icon(color) : tool.icon}
                </div>
              )
            })}
          </React.Fragment>
        )}
      </div>
    )
  }
  return <></>
})
ToolBar.displayName = 'ToolBar'
export default ToolBar

import cn from '@renderer/utils/classname'
import styles from './index.module.scss'
import React from 'react'
import { ACTIVE_TOOL_COLOR, TOOL_CONFIG, ToolCallback } from './index.constant'

interface Props {
  currentTool?: ToolCallback
  tab: Tab
  activeTab?: Tab
  onTapToolCallback: (callback: ToolCallback) => void
}

export default function ToolBar(props: Props) {
  const { tab, activeTab, onTapToolCallback, currentTool } = props
  const onTapTool = (callback: ToolCallback) => {
    onTapToolCallback(callback)
  }
  if (tab.uuid === activeTab?.uuid) {
    return (
      <div className={cn(styles.toolBlock)}>
        {activeTab.url && (
          <React.Fragment>
            {TOOL_CONFIG.map((tool) => {
              const color =
                tool.callback === currentTool && tab.isPanelVisible ? ACTIVE_TOOL_COLOR : ''
              const isRefresh = tool.callback === ToolCallback.onTabRefresh
              return (
                <div
                  onClick={() => (isRefresh && !tab.loaded ? null : onTapTool(tool.callback))}
                  className={cn(
                    isRefresh && !tab.loaded ? 'cursor-not-allowed opacity-25' : 'cursor-pointer'
                  )}
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
}

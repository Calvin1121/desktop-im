import { IconAdjustment, IconProxy, IconShuaxin } from "@renderer/components/iconfont"

export enum ToolCallback {
  onTogglePanel = 'onTogglePanel',
  onSetTabProxy = 'onSetTabProxy',
  onTabRefresh = 'onTabRefresh'
}
export const TOOL_CONFIG = [
  {
    icon: (color: string) => <IconAdjustment size={16} color={color} />,
    label: '伸缩',
    callback: ToolCallback.onTogglePanel
  },
  {
    icon: (color: string) => <IconProxy size={16} color={color} />,
    label: '代理',
    callback: ToolCallback.onSetTabProxy
  },
  {
    icon: <IconShuaxin size={16} />,
    label: '刷新',
    callback: ToolCallback.onTabRefresh
  }
]

export const ACTIVE_TOOL_COLOR = '#118dff'

export const toastStyle = { lineHeight: 1.2, padding: '0 10px', fontSize: '14px' }

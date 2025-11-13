import { IconAdjustment, IconProxy, IconShuaxin } from "@renderer/components/iconfont"

export enum ToolType {
  onTogglePanel = 'onTogglePanel',
  onSetTabProxy = 'onSetTabProxy',
  onTabRefresh = 'onTabRefresh'
}
export const TOOL_CONFIG = [
  {
    icon: (color: string) => <IconAdjustment size={16} color={color} />,
    label: '伸缩',
    callback: ToolType.onTogglePanel
  },
  {
    icon: (color: string) => <IconProxy size={16} color={color} />,
    label: '代理',
    callback: ToolType.onSetTabProxy
  },
  {
    icon: <IconShuaxin size={16} />,
    label: '刷新',
    callback: ToolType.onTabRefresh
  }
]

export const ACTIVE_TOOL_COLOR = '#118dff'

export const toastStyle = { lineHeight: 1.2, padding: '0 10px', fontSize: '14px' }

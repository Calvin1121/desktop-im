import { ToolCallback } from './index.constant'
import TabProxy from './tabProxy'

interface Props {
  currentTool?: ToolCallback
  onCancel: () => void
}
export default function ToolPanel(props: Props) {
  const { currentTool } = props
  return <TabProxy onCancel={props.onCancel} />
}

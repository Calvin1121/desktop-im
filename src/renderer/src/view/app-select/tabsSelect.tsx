import { BASE_IM_LIST } from '../../../../model'

interface Props {
  tabs: typeof BASE_IM_LIST
  tab: BaseTab
  onOpenUrl: (tab: Tab) => void
}
export default function TabsSelect(props: Props) {
  const { tab, tabs, onOpenUrl } = props
  return tabs.map((item) => (
    <div
      onClick={() => onOpenUrl({ ...tab, ...item })}
      key={item.name}
      className="flex flex-col cursor-pointer"
    >
      <span>{item.icon}</span>
      <span>{item.name}</span>
    </div>
  ))
}

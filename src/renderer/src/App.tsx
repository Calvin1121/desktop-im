import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconAddCircle, IconClose } from './components/iconfont'
import { v4 } from 'uuid'
import { BASE_IM_LIST } from './app.model'
import _ from 'lodash'

export default function App() {
  const MAX_TAB = 5
  const [tabs, setTabs] = useState<Tab[]>([])
  const [tab, setTab] = useState<Tab>()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isExceed = useMemo(() => tabs.length >= MAX_TAB, [tabs])
  const isInit = useRef(false)
  const getBounds = () => {
    const { width = window.innerWidth, height = window.innerHeight } =
      containerRef.current?.getBoundingClientRect() ?? {}
    const { height: y = 36, left: x = 0 } = barRef.current?.getBoundingClientRect() ?? {}
    return { width, height, x, y }
  }
  const onAddTab = useCallback(() => {
    if (isExceed) return
    const uuid = v4()
    const tab = { uuid, url: '' }
    setTabs((prev) => [...prev, tab])
    setTab(() => tab)
    window.api.openTab(getBounds())
    isInit.current = true
  }, [isExceed])
  const onClose = (item: Tab, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    let newTab
    if (item.uuid === tab?.uuid) {
      const index = tabs.findIndex((_tab) => _tab.uuid === item.uuid)
      newTab = tabs[index - 1]
      setTab(() => newTab)
    }
    const _tabs = tabs.filter((tab) => tab.uuid !== item.uuid)
    setTabs(() => _tabs)
    // console.info( _tabs, newTab)
    if (_tabs.length) window.api.closeTab(item, newTab, getBounds())
    else window.api.exitApp()
    e.stopPropagation()
  }
  const onSwitch = (item: Tab) => {
    if (item.uuid !== tab?.uuid) {
      setTab(() => item)
      window.api.switchTab(item, getBounds())
    }
  }
  useEffect(() => {
    onAddTab()
  }, [onAddTab])
  useEffect(() => {
    const onResize = _.debounce(() => {
      tab && window.api.resize(tab, getBounds())
    }, 200)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [tab])
  const onOpenUrl = (item: (typeof BASE_IM_LIST)[0]) => {
    const bounds = getBounds()
    const _tab = { ...tab, ...item } as Tab
    setTab(() => _tab)
    setTabs((prev) => prev.map((tab) => (tab.uuid === _tab.uuid ? _tab : tab)))
    // console.info(_tab, bounds)
    window.api.openUrl(_tab, bounds)
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div ref={barRef} className="h-[var(--tab-height)] flex bg-gray-200 pt-[4px]">
        <div className="flex gap-[2px] items-center max-w-[calc(100%-calc(var(--tab-height)-var(--tab-gap)))] px-2">
          {tabs.map((item) => (
            <div
              onClick={() => onSwitch(item)}
              className={`h-[calc(var(--tab-height)-var(--tab-gap))] min-w-15 text-black flex items-center justify-center text-sm px-2 rounded-t-sm cursor-pointer ${item.uuid === tab?.uuid ? 'bg-[#ff473f]' : 'bg-[white]'}`}
              key={item.uuid}
            >
              <span>{item.name ?? '标签页'}</span>
              <IconClose onClick={(e) => onClose(item, e)} className="ml-[2px]" size={14} />
            </div>
          ))}
        </div>
        <div className="relative h-[calc(var(--tab-height)-var(--tab-gap))] w-[calc(var(--tab-height)-var(--tab-gap))] items-center justify-center flex before:absolute before:w-[2px] before:h-[65%] before:left-0 before:top-1/2 before:-translate-y-1/2 before:bg-gray-100">
          <IconAddCircle
            className={isExceed ? 'opacity-50 cursor-deny' : 'cursor-pointer'}
            onClick={onAddTab}
            size={18}
          />
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center gap-4"
      >
        {BASE_IM_LIST.map((item) => (
          <div
            onClick={() => onOpenUrl(item)}
            key={item.name}
            className="flex flex-col cursor-pointer"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconAddCircle, IconClose } from '../../components/iconfont'
import { v4 } from 'uuid'
import _ from 'lodash'
import { BASE_IM_LIST } from '../../../../model'
import { PuffLoader } from 'react-spinners'

export default function AppSelect() {
  const MAX_TAB = 5
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>()
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
  const onAddTab = () => {
    if (isExceed) return
    const uuid = v4()
    const tab = { uuid, url: '' }
    setTabs((prev) => [...prev, tab])
    setActiveTabId(uuid)
    window.api.openTab()
    isInit.current = true
  }
  const onCloseIPCEvent = (tabs: Tab[], tab: Tab, newTab?: Tab) => {
    if (newTab) setActiveTabId(newTab?.uuid)
    if (tabs.length) {
      window.api.closeTab(tab.uuid, newTab?.uuid ?? '', getBounds())
      setTabs(tabs)
    } else window.api.exitApp()
  }
  const onClose = (item: Tab, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    const index = tabs.findIndex((tab) => tab.uuid === item.uuid)
    const _tabs = tabs.filter((tab) => tab.uuid !== item.uuid)
    const isActive = item.uuid === activeTabId
    if (isActive) {
      const nextTab = tabs[index + 1] || tabs[index - 1]
      onCloseIPCEvent(_tabs, item, nextTab)
    } else {
      onCloseIPCEvent(_tabs, item)
    }
    e.stopPropagation()
  }
  const onSwitch = useCallback(
    (item: Tab) => {
      if (item.uuid !== activeTabId) {
        setActiveTabId(item.uuid)
        window.api.switchTab(item.uuid, getBounds())
      }
    },
    [activeTabId]
  )
  useEffect(() => {
    if (!isInit.current) onAddTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onOpenUrl = useCallback((item: Tab) => {
    const bounds = getBounds()
    setActiveTabId(item.uuid)
    setTabs((prev) =>
      prev.map((tab) => (tab.uuid === item.uuid ? { ...item, loading: true } : tab))
    )
    window.api.openUrl(item, bounds)
  }, [])
  useEffect(() => {
    window.api.onTabLoaded((uuid) => {
      setTabs((prev) => prev.map((tab) => (tab.uuid === uuid ? { ...tab, loading: false } : tab)))
    })
    window.api.onTabUser((user, uuid) => {
      setTabs((prev) => prev.map((tab) => (tab.uuid === uuid ? { ...tab, user } : tab)))
    })
  }, [])
  useEffect(() => {
    window.api.onTabSwitched((uuid) => {
      onSwitch({ uuid } as Tab)
    })
  }, [onSwitch])
  useEffect(() => {
    const onResize = _.debounce(() => {
      activeTabId && window.api.resize(activeTabId, getBounds())
    }, 100)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [activeTabId])
  const tabsSelectRender = useCallback(
    (tab: Tab) =>
      BASE_IM_LIST.map((item) => (
        <div
          onClick={() => onOpenUrl({ ...tab, ...item })}
          key={item.name}
          className="flex flex-col cursor-pointer"
        >
          <span>{item.icon}</span>
          <span>{item.name}</span>
        </div>
      )),
    [onOpenUrl]
  )
  return (
    <div className="w-full h-full flex flex-col">
      <div ref={barRef} className="h-[var(--tab-height)] flex bg-[#ededed] py-[var(--tab-gap)]">
        <div className="flex gap-[2px] items-center max-w-[calc(100%-calc(var(--tab-height)-var(--tab-gap)))] px-2">
          {tabs.map((item) => {
            const userName = item.user?.userName
            const IMName = item.name
            const displayName = IMName && userName ? `${IMName}-${userName}` : IMName || '标签页'
            return (
              <div
                title={displayName}
                onClick={() => onSwitch(item)}
                className={`h-[calc(var(--tab-height)-var(--tab-gap)*2)] min-w-15 text-black flex items-center justify-center text-sm px-2 rounded-sm border cursor-pointer ${item.uuid === activeTabId ? 'bg-[white] border-[#dbdde1]' : 'bg-[#ededed] border-[#dbdde1]'}`}
                key={item.uuid}
              >
                <span>{displayName}</span>
                <IconClose onClick={(e) => onClose(item, e)} className="ml-[2px]" size={14} />
              </div>
            )
          })}
        </div>
        <div className="relative h-[calc(var(--tab-height)-var(--tab-gap)*2)] w-[calc(var(--tab-height)-var(--tab-gap))] items-center justify-center flex before:absolute before:w-[2px] before:h-[65%] before:left-0 before:top-1/2 before:-translate-y-1/2 before:bg-[#dbdde1]">
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
        {tabs.map((tab) => (
          <React.Fragment key={tab.uuid}>
            {tab.uuid === activeTabId && (
              <>
                {tab.loading && <PuffLoader loading color="#000" size={50} />}
                {!tab.loading && tabsSelectRender(tab)}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

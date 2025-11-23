import React, { useEffect, useMemo, useRef, useState } from 'react'
import { IconAddCircle, IconClose } from '../../components/iconfont'
import { v4 } from 'uuid'
import _ from 'lodash'
import { BASE_IM_LIST, MAX_TAB } from '../../../../model'
import { PuffLoader } from 'react-spinners'
import styles from './index.module.scss'
import cn from '@renderer/utils/classname'
import TabsSelect from './tabsSelect'
import ToolBar from './index.toolbar'
import ToolPanel from './index.toolpanel'
import { ToolType } from './index.constant'
import { useMainStates } from '@renderer/main.provider'
import { useIPLocation } from '@renderer/api/utils'
import { IProxyTabConfig } from 'src/model/type'

export default function AppSelect() {
  const { onToast, states } = useMainStates()
  const [tabs, setTabs] = useState<BaseTab[]>([])
  const tabStateRef = useRef<Map<string, Partial<Tab>>>(new Map())
  const [activeTabId, setActiveTabId] = useState<string>()
  const { data: ipInfo, trigger: getIPLocation } = useIPLocation()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxTab = useMemo(() => states.loginInfo?.tabCount || MAX_TAB, [states.loginInfo?.tabCount])
  const isExceed = useMemo(() => tabs.length >= maxTab, [maxTab, tabs.length])
  useEffect(() => {
    console.log(tabs)
    console.log(tabStateRef.current)
  }, [tabs])

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
    const tab = { uuid, name: '' }
    const tabState = { uuid, url: '' }
    tabStateRef.current.set(uuid, tabState)
    const _tabs = [...tabs, tab]
    setActiveTabId(uuid)
    setTabs(_tabs)
    window.api.openTab(tab)
    isInit.current = true
  }
  const onCloseIPCEvent = (tabs: BaseTab[], tab: BaseTab, newTab?: BaseTab) => {
    if (newTab?.uuid) {
      setActiveTabId(newTab?.uuid)
    }
    if (tabs.length) {
      window.api.closeTab(tab.uuid, newTab?.uuid ?? '', getBounds())
      tabStateRef.current.delete(tab.uuid)

      setTabs(tabs)
    } else window.api.exitApp()
  }
  const onClose = (item: BaseTab, e: React.MouseEvent<SVGElement, MouseEvent>) => {
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
  const onSwitch = (item: BaseTab) => {
    if (item.uuid !== activeTabId) {
      // setTabs((prev) =>
      //   prev.map((tab) =>
      //     tab.uuid === activeTabId ? { ...tab, isPanelVisible: false, toolType: undefined } : tab
      //   )
      // )
      setActiveTabId(item.uuid)
      window.api.switchTab(item.uuid, getBounds())
    }
  }
  useEffect(() => {
    if (!isInit.current) onAddTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onOpenUrl = (item: Tab) => {
    console.log(item)
    const { uuid, url, index, key, name } = item
    setTabs((prev) =>
      prev.map((tab) => (tab.uuid === uuid ? { ...tab, loading: true, name } : tab))
    )
    const prevTabState = tabStateRef.current.get(uuid) || {}
    const newTabState = Object.assign(prevTabState, { url, index, key })
    tabStateRef.current.set(uuid, newTabState)
    window.api.openUrl(item, getBounds())
  }
  useEffect(() => {
    window.api.onTabLoaded((uuid) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.uuid === uuid ? { ...tab, loading: false, loaded: true } : tab))
      )
    })
    window.api.onTabUser((user, uuid) => {
      const tabState = tabStateRef.current.get(uuid) || {}
      Object.assign(tabState, { user, uuid })
      tabStateRef.current.set(uuid, tabState)
      setTabs((prev) =>
        prev.map((tab) => (tab.uuid === uuid ? { ...tab, userName: user.userName } : tab))
      )
      // setTabs((prev) => prev.map((tab) => (tab.uuid === uuid ? { ...tab, user } : tab)))
    })
    window.api.onTabSwitched((uuid) => {
      setActiveTabId(uuid)
      window.api.switchTab(uuid, getBounds())
    })
  }, [])
  useEffect(() => {
    const onResize = _.debounce(() => {
      activeTabId && window.api.resize(activeTabId, getBounds())
    }, 100)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [activeTabId])
  const onRefreshTab = () => {
    if (activeTabId) {
      const onSaving = async () => {
        await window.api.refreshTab(activeTabId)
        _.delay(() => {
          setTabs((tabs) =>
            tabs.map((tab) => (tab.uuid === activeTabId ? { ...tab, isRefreshing: false } : tab))
          )
        }, 1000)
      }
      onToast({ callback: onSaving(), loading: '刷新中', success: '刷新成功' })
      setTabs((tabs) =>
        tabs.map((tab) => (tab.uuid === activeTabId ? { ...tab, isRefreshing: true } : tab))
      )
    }
  }
  const onUpdateTabsByToolbar = (toolType?: ToolType) => {
    if (activeTabId) {
      const _tab = tabs.find((tab) => tab.uuid === activeTabId)
      if (!_tab || tabStateRef.current.get(activeTabId)?.toolType === toolType) return
      _tab.isPanelVisible = !!toolType
      window.api.toggleTab(activeTabId, !_tab.isPanelVisible)
      const currentTabState = { ...tabStateRef.current.get(activeTabId), toolType }
      tabStateRef.current.set(activeTabId, currentTabState)
      setTabs([...tabs])
    }
  }
  const onTapToolCallback = (toolType: ToolType) => {
    if (activeTabId) {
      if ([ToolType.onTabRefresh].includes(toolType)) {
        onRefreshTab()
        return
      }
      const currentTabState = tabStateRef.current.get(activeTabId)
      if (toolType === ToolType.onTogglePanel && currentTabState?.toolType) {
        onUpdateTabsByToolbar(undefined)
        return
      }
      const _toolType =
        toolType === ToolType.onTogglePanel && !currentTabState?.toolType
          ? ToolType.onSetTabProxy
          : toolType
      onUpdateTabsByToolbar(_toolType)
    }
  }

  const onToolConfigConfirm = (
    config: Record<string, any>,
    toolType?: ToolType,
    isManual?: boolean
  ) => {
    if (!activeTabId || !toolType) return
    if (toolType === ToolType.onSetTabProxy) {
      const ip = config.serve ? config.ip || '' : ''
      getIPLocation({ uuid: activeTabId, ip })
      window.api.tabProxy(activeTabId, config as IProxyTabConfig)
    }
    const tabState = tabStateRef.current.get(activeTabId) || {}
    const configMap = tabState?.configMap || {}
    const _config = { ..._.get(configMap, toolType), ...config }
    _.set(configMap, toolType, _config)
    _.set(tabState, 'configMap', configMap)
    tabStateRef.current.set(activeTabId, tabState)
    if (isManual) onUpdateTabsByToolbar(undefined)
  }

  useEffect(() => {
    if (activeTabId) {
      const config = _.get(
        tabStateRef.current.get(activeTabId)?.configMap,
        ToolType.onSetTabProxy
      ) || { ip: '', serve: false }
      const _ip = config.serve ? config.ip || '' : ''
      getIPLocation({ uuid: activeTabId, ip: _ip })
    }
  }, [activeTabId, getIPLocation])

  useEffect(() => {
    if (ipInfo?.uuid) {
      const { uuid, ...rest } = ipInfo
      const tabState = tabStateRef.current.get(uuid) || {}
      const configMap = tabState?.configMap || {}
      const proxyConfig = { ..._.get(configMap, ToolType.onSetTabProxy), ...rest }
      if (!proxyConfig.agent) proxyConfig.agent = window.navigator.userAgent
      _.set(configMap, ToolType.onSetTabProxy, proxyConfig)
      _.set(tabState, 'configMap', configMap)
      tabStateRef.current.set(uuid, tabState)
    }
  }, [ipInfo])

  return (
    <div className={styles.container}>
      <div ref={barRef} className={styles.tabBar}>
        <div className={styles.tabBarContent}>
          {tabs.map((item) => {
            const userName = item.userName
            const IMName = item.name
            const displayName = IMName && userName ? `${IMName}-${userName}` : IMName || '标签页'
            return (
              <div
                data-tabid={item.uuid}
                title={displayName}
                onClick={() => onSwitch(item)}
                className={cn(
                  styles.tabBarItem,
                  item.uuid === activeTabId
                    ? 'bg-[white] border-[#dbdde1]'
                    : 'bg-[#ededed] border-[#dbdde1]'
                )}
                key={item.uuid}
              >
                <span className="select-none whitespace-nowrap text-ellipsis overflow-hidden">
                  {displayName}
                </span>
                <IconClose onClick={(e) => onClose(item, e)} className="ml-[2px]" size={14} />
              </div>
            )
          })}
        </div>
        <div className={styles.addTab}>
          <IconAddCircle
            className={isExceed ? 'opacity-50 cursor-deny' : 'cursor-pointer'}
            onClick={onAddTab}
            size={18}
          />
        </div>
      </div>
      <div ref={containerRef} className={styles.viewContainer}>
        {tabs.map((tab) => (
          <React.Fragment key={tab.uuid}>
            {tab.uuid === activeTabId && (
              <>
                {!tab.isPanelVisible && (
                  <>
                    {tab.loading && <PuffLoader loading color="#000" size={50} />}
                    {!tab.loading && !tab.loaded && (
                      <TabsSelect tab={tab} tabs={BASE_IM_LIST} onOpenUrl={onOpenUrl} />
                    )}
                  </>
                )}
                {tab.isPanelVisible && (
                  <ToolPanel
                    tabState={tabStateRef.current.get(activeTabId)}
                    onCancel={() => onTapToolCallback(ToolType.onTogglePanel)}
                    onConfirm={onToolConfigConfirm}
                  />
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
      {tabs.map((tab) => (
        <React.Fragment key={tab.uuid}>
          {tab.uuid === activeTabId && (
            <ToolBar
              tab={tab}
              tabState={tabStateRef.current.get(activeTabId)}
              onTapToolCallback={onTapToolCallback}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { IProxyTabConfig } from 'src/model/type'
import { useIPLocation } from '@renderer/api/utils'

export default function AppSelect() {
  const { trigger: getIPLocation } = useIPLocation()
  const { onToast, states } = useMainStates()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxTab = useMemo(() => states.loginInfo?.tabCount || MAX_TAB, [states.loginInfo?.tabCount])
  const isExceed = useMemo(() => tabs.length >= maxTab, [maxTab, tabs.length])
  const updatingProxyConfigSet = useRef<Map<string, boolean>>(new Map())
  const activeTab = useMemo(
    () => tabs.find((item) => item.uuid === activeTabId),
    [tabs, activeTabId]
  )
  const toolType = useMemo(() => activeTab?.toolType, [activeTab?.toolType])
  const configMap = useMemo(() => activeTab?.configMap, [activeTab?.configMap])
  const proxyConfig = useMemo(() => _.get(configMap, ToolType.onSetTabProxy), [configMap])
  // const onUpdateTabs = useCallback((uuid?: string, callback?: (tab: Tab) => void) => {
  //   setTabs((prev) =>
  //     prev.map((tab) => {
  //       if (tab.uuid === uuid) callback?.(tab)
  //       return tab
  //     })
  //   )
  // }, [])

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
  const onSwitch = (item: Tab) => {
    if (item.uuid !== activeTabId) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.uuid === activeTabId ? { ...tab, isPanelVisible: false, toolType: undefined } : tab
        )
      )
      setActiveTabId(item.uuid)
      window.api.switchTab(item.uuid, getBounds())
    }
  }
  useEffect(() => {
    if (!isInit.current) onAddTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onOpenUrl = useCallback((item: Tab) => {
    const bounds = getBounds()
    setActiveTabId(item.uuid)
    setTabs((prev) =>
      prev.map((tab) => (tab.uuid === item.uuid ? { ...tab, ...item, loading: true } : tab))
    )
    window.api.openUrl(item, bounds)
  }, [])
  useEffect(() => {
    window.api.onTabLoaded((uuid) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.uuid === uuid ? { ...tab, loading: false, loaded: true } : tab))
      )
    })
    window.api.onTabUser((user, uuid) => {
      setTabs((prev) => prev.map((tab) => (tab.uuid === uuid ? { ...tab, user } : tab)))
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
    if (activeTab?.isRefreshing) return
    const onSaving = async () => {
      await window.api.refreshTab(activeTabId!)
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.uuid === activeTabId && tab.isRefreshing) tab.isRefreshing = false
          return tab
        })
      )
    }
    onToast({ callback: onSaving(), loading: '刷新中', success: '刷新成功' })
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.uuid === activeTabId && !tab.isRefreshing) tab.isRefreshing = true
        return tab
      })
    )
  }
  const onTogglePanel = (toolType) => {
    if (ToolType.onSetTabProxy === toolType || !toolType) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.uuid === activeTabId) {
            tab.isPanelVisible = !!toolType
            window.api.toggleTab(tab.uuid, !tab.isPanelVisible)
          }
          return tab
        })
      )
    }
  }
  const onUpdateTabsByToolbar = (toolType?: ToolType) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.uuid === activeTabId) {
          tab.toolType = toolType
          onTogglePanel(tab.toolType)
        }
        return tab
      })
    )
  }
  const onTapToolCallback = (toolType: ToolType) => {
    if ([ToolType.onTabRefresh].includes(toolType)) {
      onRefreshTab()
      return
    }
    if (toolType === ToolType.onTogglePanel && activeTab?.toolType) {
      onUpdateTabsByToolbar(undefined)
      return
    }
    const _toolType =
      toolType === ToolType.onTogglePanel && !activeTab?.toolType
        ? ToolType.onSetTabProxy
        : toolType
    onUpdateTabsByToolbar(_toolType)
  }

  const onToolConfigConfirm = (
    config: Record<string, any>,
    toolType?: ToolType,
    isManual?: boolean
  ) => {
    if (!activeTabId || !toolType) return
    const _prevToolConfig = activeTab?.configMap?.[toolType]
    const isUpdate = !_.isEqual(config, _prevToolConfig)
    if (!isUpdate) return
    const configMap = activeTab?.configMap ?? {}
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.uuid === activeTabId) {
          tab.configMap = { ...configMap, [toolType]: config }
        }
        return tab
      })
    )
    if (isManual) onUpdateTabsByToolbar(undefined)
  }
  const updateProxyConfig = async (inProxyConfig: IProxyTabConfig, activeTabId: string) => {
    const proxyConfigSet = updatingProxyConfigSet.current
    if (proxyConfigSet.get(activeTabId)) return
    proxyConfigSet.set(activeTabId, true)
    const _proxyConfig = { ...inProxyConfig }
    // if (inProxyConfig?.ip !== proxyConfig?.id) {
    const ipInfo = await getIPLocation({ ip: _proxyConfig?.ip ?? '' })
    const ipConfig = _.pick(ipInfo, ['ip', 'timezone', 'country'])
    Object.assign(_proxyConfig, ipConfig)
    // }

    if (!_proxyConfig.agent) _proxyConfig.agent = window.navigator.userAgent
    proxyConfigSet.delete(activeTabId)
    onToolConfigConfirm(_proxyConfig, ToolType.onSetTabProxy)
  }

  useEffect(() => {
    activeTabId && updateProxyConfig(proxyConfig, activeTabId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyConfig, activeTabId])

  return (
    <div className={styles.container}>
      <div ref={barRef} className={styles.tabBar}>
        <div className={styles.tabBarContent}>
          {tabs.map((item) => {
            const userName = item.user?.userName
            const IMName = item.name
            const displayName = IMName && userName ? `${IMName}-${userName}` : IMName || '标签页'
            return (
              <div
                data-userid={item.user?.userId ?? 'unlogin'}
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
        {/* {tabs.map((tab) => (
          <React.Fragment key={tab.uuid}> */}
        {activeTab && (
          <>
            {activeTab.loading && !activeTab.isPanelVisible && (
              <PuffLoader loading color="#000" size={50} />
            )}
            {!activeTab.loading && !activeTab.loaded && (
              <TabsSelect tab={activeTab} tabs={BASE_IM_LIST} onOpenUrl={onOpenUrl} />
            )}
            {activeTab.isPanelVisible && (
              <ToolPanel
                toolType={toolType}
                configMap={configMap}
                onCancel={() => onTapToolCallback(ToolType.onTogglePanel)}
                onConfirm={onToolConfigConfirm}
              />
            )}
          </>
        )}
        {/* </React.Fragment>
        ))} */}
      </div>
      {activeTab && <ToolBar tab={activeTab} onTapToolCallback={onTapToolCallback} />}
    </div>
  )
}

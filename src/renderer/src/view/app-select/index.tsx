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
import { toastStyle, ToolCallback } from './index.constant'
import toast, { Toaster } from 'react-hot-toast'

export default function AppSelect() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isExceed = useMemo(() => tabs.length >= MAX_TAB, [tabs])

  const activeTab = useMemo(
    () => tabs.find((item) => item.uuid === activeTabId),
    [tabs, activeTabId]
  )
  const onUpdateTabs = useCallback((uuid?: string, callback?: (tab: Tab) => void) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.uuid === uuid) callback?.(tab)
        return tab
      })
    )
  }, [])
  useEffect(() => {
    const onSendMsgCallback = (event) => {
      const params = event.detail
      console.log(params)
      window.api.sendMsg(params)
    }
    window.addEventListener('sendMsg', onSendMsgCallback)
    return () => {
      window.removeEventListener('sendMsg', onSendMsgCallback)
    }
  }, [])

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
      onUpdateTabs(activeTabId, (tab) => {
        tab.isPanelVisible = false
        tab.currentTool = undefined
      })
      setActiveTabId(item.uuid)
      window.api.switchTab(item.uuid, getBounds())
    }
  }
  useEffect(() => {
    if (!isInit.current) onAddTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onOpenUrl = useCallback(
    (item: Tab) => {
      const bounds = getBounds()
      setActiveTabId(item.uuid)
      onUpdateTabs(item.uuid, (tab) => Object.assign(tab, { ...item, loading: true }))
      window.api.openUrl(item, bounds)
    },
    [onUpdateTabs]
  )
  useEffect(() => {
    window.api.onTabLoaded((uuid) =>
      onUpdateTabs(uuid, (tab) => Object.assign(tab, { loading: false, loaded: true }))
    )
    window.api.onTabUser((user, uuid) => {
      onUpdateTabs(uuid, (tab) => Object.assign(tab, user))
    })
    window.api.onTabSwitched((uuid) => {
      setActiveTabId(uuid)
      window.api.switchTab(uuid, getBounds())
    })
  }, [onUpdateTabs])
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
    const onSaving = async (tab: Tab) => {
      await window.api.refreshTab(tab.uuid)
      onUpdateTabs(activeTabId, (tab) => {
        if (tab.isRefreshing) tab.isRefreshing = false
      })
    }
    onUpdateTabs(activeTabId, (tab) => {
      if (!tab.isRefreshing) {
        tab.isRefreshing = true
        toast.promise(onSaving(tab), {
          loading: '刷新中',
          success: '刷新成功'
        })
      }
    })
  }
  const onTogglePanel = (toolType) => {
    if (ToolCallback.onSetTabProxy === toolType || !toolType) {
      onUpdateTabs(activeTabId, (tab) => {
        tab.isPanelVisible = !!toolType
        window.api.toggleTab(tab.uuid, !tab.isPanelVisible)
      })
    }
  }
  const onUpdateTabsByToolbar = (toolType?: ToolCallback) => {
    onUpdateTabs(activeTabId, (tab) => {
      tab.currentTool = toolType
      onTogglePanel(tab.currentTool)
    })
  }
  const onTapToolCallback = (callback: ToolCallback) => {
    if ([ToolCallback.onTabRefresh].includes(callback)) {
      onRefreshTab()
      return
    }
    if (callback === ToolCallback.onTogglePanel && activeTab?.currentTool) {
      onUpdateTabsByToolbar(undefined)
      return
    }
    const _callback =
      callback === ToolCallback.onTogglePanel && !activeTab?.currentTool
        ? ToolCallback.onSetTabProxy
        : callback
    onUpdateTabsByToolbar(_callback)
  }

  const onToolConfigConfirm = (
    config: Record<string, any>,
    toolType?: ToolCallback,
    isManual?: boolean
  ) => {
    const isUpdate = !_.isEqual(config, _.get(activeTab?.configMap, toolType))
    if (activeTab && toolType && isUpdate) {
      onUpdateTabs(activeTabId, (tab) => {
        tab.configMap = tab.configMap ?? {}
        _.set(tab.configMap, toolType, config)
      })
    }
    if (isManual) onUpdateTabsByToolbar(undefined)
  }

  return (
    <div className={styles.container}>
      <Toaster
        position="top-center"
        toastOptions={{ style: toastStyle }}
        containerClassName={styles.toasterContainer}
      />
      <div ref={barRef} className={styles.tabBar}>
        <div className={styles.tabBarContent}>
          {tabs.map((item) => {
            const userName = item.user?.userName
            const IMName = item.name
            const displayName = IMName && userName ? `${IMName}-${userName}` : IMName || '标签页'
            return (
              <div
                data-userId={item.user?.userId ?? 'unlogin'}
                data-tabId={item.uuid}
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
                tab={activeTab}
                onCancel={() => onTapToolCallback(ToolCallback.onTogglePanel)}
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

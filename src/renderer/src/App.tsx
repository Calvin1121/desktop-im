import { useEffect, useState } from 'react'
import { IconAddCircle, IconClose } from './components/iconfont'

function App(): React.JSX.Element {
  const [tabs, setTabs] = useState<{ uuid: string, url: string }[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  useEffect(() => {
    window.api.CreatedTab((_: Electron.IpcMainEvent, uuid: string, url: string) => {
      setTabs((prev) => {
        const isExisting = prev.find((item) => item.uuid === uuid)
        if (isExisting) {
          return prev
        }
        setActiveTab(uuid)
        return [...prev, { uuid, url }]
      })
      // console.info(event, uuid, url)
    })
  }, [])
  const onAddTab = (): void => {
    // window.electron.ipcRenderer.send('ping')
    window.api.addTab('test')
  }

  const onCloseTab = (uuid: string): void => {
    const targetIndex = tabs.findIndex((item) => item.uuid === uuid)
    setTabs((prev) => prev.filter((item) => item.uuid !== uuid))
    if (activeTab === uuid) {
      setActiveTab(tabs[Math.max(targetIndex, 0) - 1]?.uuid)
    }
    // console.info(activeTab, uuid)
    // console.info(uuid)
    // window.api.closeTab(uuid)
  }

  return (
    <div className='flex flex-col'>
      <div className='flex items-center flex bg-amber-100'>
        <div className='max-w-[calc(100%-36px)] pt-[6px] px-2 flex gap-[4px]'>
          {tabs.map((item, index) => <div className='flex items-center rounded-t-lg h-[30px] px-1 bg-amber-50' key={item.uuid}>
            <span className='text-sm'>标签页{index + 1}</span>
            <IconClose className='cursor-pointer' onClick={() => onCloseTab(item.uuid)} size={14} />
          </div>)}
        </div>
        <div className='before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:bg-amber-400 before:w-[2px] before:h-[20px] relative w-[36px] h-[36px] flex items-center justify-center translate-y-[2px]'
          onClick={onAddTab}><IconAddCircle className='cursor-pointer' size={18} /></div>
      </div>
      <div className='flex-1 overflow-hidden'></div>
    </div>
  )
}

export default App

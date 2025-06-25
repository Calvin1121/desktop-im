import { app, Menu, MenuItem, MenuItemConstructorOptions } from 'electron'

export const DEFAULT_MENUS: Array<MenuItemConstructorOptions | MenuItem> = [
  {
    label: app.name,
    submenu: [
      { role: 'about', label: '关于' },
      { type: 'separator' },
      { role: 'hide', label: '隐藏' },
      { role: 'quit', label: '退出' }
    ]
  },
  {
    label: '视图',
    submenu: [
      { role: 'toggleDevTools', label: '开发工具' },
      { role: 'togglefullscreen', label: '切换全屏' }
    ]
  }
]

export const onCustomerMenu = (menus = DEFAULT_MENUS) => {
  const customMenu = Menu.buildFromTemplate(menus)
  Menu.setApplicationMenu(customMenu)
  return customMenu
}

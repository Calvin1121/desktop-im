import { Notification } from 'electron'
import os from 'node:os'
import { exec } from 'node:child_process'

export function showNotificationWithPermissionCheck(
  options: Electron.NotificationConstructorOptions,
  callback?: () => void
) {
  if (!Notification.isSupported()) {
    console.warn('通知不被支持')
    return
  }
  try {
    const notification = new Notification(options)
    notification.on('click', () => callback?.())
    notification.show()
  } catch (err) {
    console.error('通知显示失败:', err)
  }
}

function openNotificationSettings() {
  const platform = os.platform()

  if (platform === 'darwin') {
    exec('open "x-apple.systempreferences:com.apple.preference.notifications"', (err) => {
      if (err) {
        exec('open "/System/Library/PreferencePanes/Notifications.prefPane"')
      }
    })
  } else if (platform === 'win32') {
    exec('start ms-settings:notifications')
  } else if (platform === 'linux') {
    console.warn('Linux 不支持自动打开通知设置，请用户手动操作')
  }
}

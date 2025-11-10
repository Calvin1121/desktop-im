import { IconSwitch } from '@renderer/components/iconfont'

// eslint-disable-next-line react-refresh/only-export-components
export enum FieldType {
  Input = 'input',
  Checkbox = 'checkbox',
  Select = 'select',
  Button = 'button'
}

export const ProxyConfig = [
  {
    sectionName: '编辑指纹环境',
    key: 'finger-print',
    sections: [
      { label: '名称', key: 'name', value: null as any, type: FieldType.Input },
      {
        label: '操作系统',
        key: 'system',
        value: null as any,
        type: FieldType.Checkbox,
        tips: '',
        options: [
          { label: 'Windows', value: 'Win32' },
          { label: 'MacOs', value: 'MacIntel' },
          { label: 'Others', value: 'Linux armv8l' }
        ] as any
      },
      {
        label: 'User Agent',
        key: 'agent',
        value: null as any,
        type: FieldType.Input,
        props: {
          allowClear: true,
          suffix: (onSuffixClick: (section: any) => void) => (
            <span title="一键生成">
              <IconSwitch onClick={onSuffixClick} className="cursor-pointer" />
            </span>
          )
        }
      }
    ]
  },
  {
    sectionName: '代理设置',
    key: 'proxy',
    sections: [
      { label: '代理服务器', key: 'serve', value: '', type: FieldType.Checkbox },
      {
        label: '选择代理',
        key: 'select',
        value: null as any,
        type: FieldType.Input,
        tips: ''
      },
      {
        label: '代理类型',
        key: 'type',
        value: null as any,
        type: FieldType.Select,
        tips: '',
        options: [
          { label: 'HTTP', value: 'HTTP' },
          { label: 'HTTPS', value: 'HTTPS' },
          { label: 'SOCKS4', value: 'SOCKS4' },
          { label: 'SOCKS5', value: 'SOCKS5' }
        ] as any
      }
    ]
  }
] as const

export type ProxyConfigType = typeof ProxyConfig

export type ProxyConfigSections = ProxyConfigType[number]['sections']

export type ProxyConfigSection = ProxyConfigSections[number]

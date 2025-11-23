/* eslint-disable react-refresh/only-export-components */
import { IconSwitch } from '@renderer/components/iconfont'

export enum FieldType {
  Input = 'input',
  Checkbox = 'checkbox',
  Select = 'select',
  Button = 'button'
}

export const ipRules = [
  { required: true, message: '请输入 IP:端口' },
  {
    pattern: /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3})?$/,
    message: '请输入正确的 IPv4 地址与端口，如 192.168.1.1'
  }
]
export const portRules = [
  {
    pattern:
      /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
    message: '请输入正确的 IPv4 端口，如 8080'
  }
]
export const ipTypeRules = [{ required: true, message: '请选择代理类型' }]
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
      { label: '启动代理', key: 'serve', value: '', type: FieldType.Checkbox },
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
      },
      {
        label: 'IP地址',
        key: 'ip',
        value: null as any,
        type: FieldType.Input,
        tips: '',
        dependencies: ['serve']
      },
      {
        label: 'IP端口',
        key: 'port',
        value: null as any,
        type: FieldType.Input,
        tips: '',
        dependencies: ['serve']
      }
    ]
  }
] as const

export type ProxyConfigType = typeof ProxyConfig

export type ProxyConfigSections = ProxyConfigType[number]['sections']

export type ProxyConfigSection = ProxyConfigSections[number]

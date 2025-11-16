/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FieldType, ProxyConfig, ProxyConfigSection, ProxyConfigType } from './tabProxy.config'
import { Button, Checkbox, Form, Input, Select, Space } from 'antd'
import { IProxyTabConfig } from 'src/model/type'
import _ from 'lodash'
import { removeEmpty } from '@renderer/utils/util'

interface Props {
  config: IProxyTabConfig
  onCancel: () => void
  onConfirm: (config: IProxyTabConfig, isManual?: boolean) => void
}
const TabProxy: React.FC<Props> = React.memo((props: Props) => {
  const isGotIpRef = useRef(false)
  const { onCancel, onConfirm, config: configProps } = props
  const [configs, setConfigs] = useState<ProxyConfigType>(ProxyConfig)
  const [defaultIpConfig, setDefaultIpConfig] = useState<Partial<IProxyTabConfig>>()
  const IpConfig = useMemo(
    () => (configProps?.ip ? configProps : defaultIpConfig),
    [configProps, defaultIpConfig]
  )
  const [form] = Form.useForm()
  const [config, setConfig] = useState<IProxyTabConfig>()
  const onGenUserAgent = useCallback(
    async (key: string) => {
      const value = form.getFieldValue('system')
      const agent = await window.api.genUserAgent(value)
      form.setFieldValue(key, agent)
      setConfig((prev = {} as IProxyTabConfig) => ({ ...prev, agent }))
    },
    [form]
  )
  const onSuffixClick = useCallback(
    (section: ProxyConfigSection) => {
      if (section.key === 'agent') onGenUserAgent(section.key)
    },
    [onGenUserAgent]
  )
  const onFinish = (values: any) => {
    const config = removeEmpty(values)
    onConfirm(config, true)
  }
  useEffect(() => {
    const initTab = async () => {
      const _configProps = _.cloneDeep(configProps || {})
      if (!_configProps.agent) _configProps.agent = window.navigator.userAgent
      form.setFieldsValue(_configProps)
      setConfig(_configProps)
      if (!_.isEqual(_configProps, configProps)) onConfirm(_configProps)
    }
    initTab()
  }, [configProps, form, onConfirm])
  const getIPLocation = async (ip?: string, port?: string) => {
    if (isGotIpRef.current) return
    isGotIpRef.current = true
    const ipInfo = await window.api.getIPLocation(ip, port)
    const ipConfig = _.pick(ipInfo, ['ip', 'timezone', 'city', 'country'])
    isGotIpRef.current = false
    if (ip && port) {
      setConfig((prev) => ({ ...prev, ...ipConfig }))
    } else {
      setDefaultIpConfig(ipConfig)
    }
  }
  useEffect(() => {
    if (!configProps?.ip && !defaultIpConfig) getIPLocation()
  }, [configProps?.ip, defaultIpConfig])
  useEffect(() => {
    if (configProps?.ip && configProps?.port) getIPLocation(configProps.ip, configProps.port)
  }, [configProps?.ip, configProps?.port])
  const onFieldsChange = (changedFields) => {
    const field = changedFields[0]
    const fieldName = field?.name?.[0]
    const filedValue = field?.value
    // form.setFieldValue(fieldName, filedValue)
    const _configs = configs.map((config) => {
      const { sections, ...rest } = config
      return {
        ...rest,
        sections: sections.map((section) => {
          if (section.key === fieldName) section.value = filedValue
          return section
        })
      }
    })
    setConfigs(_configs as any)
  }
  const dynamicField = useCallback(
    (section: ProxyConfigSection) => {
      const options = ('options' in section && section.options) || null
      const isSingleCheckbox = section.type === FieldType.Checkbox && !options
      const props = (('props' in section && section.props) || {}) as any
      const { suffix: _suffix, ...rest } = props
      const disabled =
        ['ip', 'port'].includes(section.key) && !form.getFieldValue('serve') ? true : false
      const suffix = _suffix instanceof Function ? _suffix(() => onSuffixClick(section)) : _suffix
      return (
        <>
          {isSingleCheckbox && <Checkbox value={section.value}>{section.label}</Checkbox>}
          {!isSingleCheckbox && (
            <React.Fragment>
              {section.type === FieldType.Input && (
                <Input
                  {...rest}
                  disabled={disabled}
                  suffix={suffix}
                  className="!w-full"
                  value={section.value}
                />
              )}
              {section.type === FieldType.Checkbox && (
                <Checkbox.Group
                  disabled={disabled}
                  options={options}
                  value={section.value}
                ></Checkbox.Group>
              )}
              {section.type === FieldType.Select && (
                <Select disabled={disabled} className="!w-full" options={options}></Select>
              )}
            </React.Fragment>
          )}
        </>
      )
    },
    [form, onSuffixClick]
  )
  const dynamicFormItem = useCallback(
    (section) => {
      const { key, label } = section
      const props = { name: key, label }
      if (section.type === FieldType.Checkbox && !section.options) {
        Object.assign(props, { valuePropName: 'checked' })
      }
      return <Form.Item {...props}>{dynamicField(section)}</Form.Item>
    },
    [dynamicField]
  )
  return (
    <div className="flex flex-col w-full h-full overflow-hidden !p-2">
      <div className="!font-semibold py-1 border-b-[1px] border-[#d9d9d9]">代理设置</div>
      <div className="flex-1 py-1 overflow-scroll flex gap-4">
        <div className="flex-2">
          <Form
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            form={form}
            onFinish={onFinish}
            onFieldsChange={onFieldsChange}
            name="proxyForm"
          >
            {configs.map((item) => (
              <React.Fragment key={item.key}>
                <section>
                  <div className="!font-semibold !mb-2">{item.sectionName}</div>
                  <main>
                    {item.sections.map((section) => (
                      <React.Fragment key={section.key}>{dynamicFormItem(section)}</React.Fragment>
                    ))}
                  </main>
                </section>
              </React.Fragment>
            ))}
            <Form.Item label={null}>
              <Space>
                <Button onClick={onCancel} htmlType="button">
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  应用
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
        <div className="flex-1">
          <div className="!font-semibold py-1 border-b-[1px] border-[#d9d9d9]">指纹预览</div>
          <div className="configs p-2 bg-[#d9d9d9] text-[14px] text-black/88">
            <div className="flex items-start !mb-2">
              <div className="w-24">User Agent</div>
              <div className="flex-1 text-right">{config?.agent || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">时区</div>
              <div className="flex-1 text-right">{IpConfig?.timezone || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">IP地址</div>
              <div className="flex-1 text-right">{IpConfig?.ip || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">地理位置</div>
              <div className="flex-1 text-right">
                <>{IpConfig?.city}</>
                <>
                  {IpConfig?.country ? '|' : ''}
                  {IpConfig?.country || '-'}
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
TabProxy.displayName = 'TabProxy'
export default TabProxy

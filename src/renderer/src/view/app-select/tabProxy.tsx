/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react'
import { FieldType, ProxyConfig, ProxyConfigSection } from './tabProxy.config'
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
  const { onCancel, onConfirm, config: configProps } = props
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
      if (!_configProps.ip) {
        const ipInfo = await window.api.getIPLocation()
        Object.assign(_configProps, _.pick(ipInfo, ['ip', 'timezone', 'city', 'country']))
      }
      setConfig(_configProps)
      if (!_.isEqual(_configProps, configProps)) onConfirm(_configProps)
    }
    initTab()
  }, [configProps, form, onConfirm])
  const dynamicField = useCallback(
    (section: ProxyConfigSection) => {
      const options = ('options' in section && section.options) || null
      const isSingleCheckbox = section.type === FieldType.Checkbox && !options
      const props = (('props' in section && section.props) || {}) as any
      const { suffix: _suffix, ...rest } = props
      const suffix = _suffix instanceof Function ? _suffix(() => onSuffixClick(section)) : _suffix
      return (
        <>
          {isSingleCheckbox && <Checkbox value={section.value}>{section.label}</Checkbox>}
          {!isSingleCheckbox && (
            <React.Fragment>
              {section.type === FieldType.Input && (
                <Input {...rest} suffix={suffix} className="!w-full" value={section.value} />
              )}
              {section.type === FieldType.Checkbox && (
                <Checkbox.Group options={options} value={section.value}></Checkbox.Group>
              )}
              {section.type === FieldType.Select && (
                <Select className="!w-full" options={options}></Select>
              )}
            </React.Fragment>
          )}
        </>
      )
    },
    [onSuffixClick]
  )
  const dynamicFormItem = useCallback(
    (section) => {
      const { key, label } = section
      const props = { key, name: key, label }
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
            name="proxyForm"
          >
            {ProxyConfig.map((item) => (
              <React.Fragment key={item.key}>
                <section>
                  <div className="!font-semibold !mb-2">{item.sectionName}</div>
                  <main>{item.sections.map((section) => dynamicFormItem(section))}</main>
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
              <div className="flex-1 text-right">{config?.timezone || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">IP地址</div>
              <div className="flex-1 text-right">{config?.ip || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">地理位置</div>
              <div className="flex-1 text-right">
                <>
                  {config?.city}
                  {config?.city ? '|' : ''}
                </>
                <>{config?.country || '-'}</>
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

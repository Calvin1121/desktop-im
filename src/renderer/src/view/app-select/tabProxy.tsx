import React, { useState } from 'react'
import {
  FieldType,
  ipRules,
  ipTypeRules,
  ProxyConfig,
  ProxyConfigSection,
  ProxyConfigType
} from './tabProxy.config'
import { Button, Checkbox, Form, Input, Select, Space } from 'antd'
import { IProxyTabConfig } from 'src/model/type'
import _ from 'lodash'
import { removeEmpty } from '@renderer/utils/util'

interface Props {
  config?: IProxyTabConfig
  onCancel: () => void
  onConfirm: (config: IProxyTabConfig, isManual?: boolean) => void
}
const TabProxy: React.FC<Props> = React.memo((props: Props) => {
  const { onCancel, onConfirm, config: configProps } = props
  const [configs, setConfigs] = useState<ProxyConfigType>(ProxyConfig)
  const [form] = Form.useForm()
  const [config, setConfig] = useState<IProxyTabConfig>(() => configProps as IProxyTabConfig)
  const onGenUserAgent = async () => {
    const value = form.getFieldValue('system')
    const agent = await window.api.genUserAgent(value)
    form.setFieldsValue({ agent })
    setConfig((prev = {} as IProxyTabConfig) => ({ ...prev, agent }))
  }
  const onSuffixClick = (section: ProxyConfigSection) => {
    if (section.key === 'agent') onGenUserAgent()
  }
  const onFinish = async (values: any) => {
    const config = removeEmpty(values ?? {})
    onConfirm(config, !!values)
  }
  const onFieldsChange = (changedFields) => {
    const field = changedFields[0]
    const fieldName = field?.name?.[0]
    const filedValue = field?.value
    if (fieldName === 'serve' && !filedValue)
      form.setFields([
        { name: 'ip', errors: [] },
        { name: 'type', errors: [] }
      ])
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
  const onDisabled = (section) => {
    if (section.key === 'ip') {
      return !(form.getFieldValue('serve') ?? configProps?.serve)
    }
    return false
  }
  const onRules = (section) => {
    const isServe = form.getFieldValue('serve') ?? configProps?.serve
    if (section.key === 'ip' && isServe) return ipRules
    if (section.key === 'type' && isServe) return ipTypeRules
    return undefined
  }
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
            initialValues={configProps}
            scrollToFirstError
            onFinish={onFinish}
            onFieldsChange={onFieldsChange}
            name="proxyForm"
          >
            {configs.map((item) => (
              <React.Fragment key={item.key}>
                <section>
                  <div className="!font-semibold !mb-2">{item.sectionName}</div>
                  <main>
                    {item.sections.map((section) => {
                      const { key, label, options, props } = section
                      const rules = onRules(section)
                      const disabled = onDisabled(section)
                      const itemProps = { name: key, label, rules }
                      const isSingleCheckbox = section.type === FieldType.Checkbox && !options
                      const rest = _.omit(props, 'suffix')
                      const _suffix = _.get(props, 'suffix')
                      const suffix =
                        _suffix instanceof Function
                          ? _suffix(() => onSuffixClick?.(section))
                          : _suffix
                      if (section.type === FieldType.Checkbox && !section.options) {
                        Object.assign(itemProps, { valuePropName: 'checked' })
                      }

                      return (
                        <React.Fragment key={section.key}>
                          <Form.Item {...itemProps}>
                            <>
                              {isSingleCheckbox && (
                                <Checkbox value={section.value}>{section.label}</Checkbox>
                              )}
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
                                    <Select
                                      disabled={disabled}
                                      className="!w-full"
                                      options={options}
                                    ></Select>
                                  )}
                                </React.Fragment>
                              )}
                            </>
                          </Form.Item>
                        </React.Fragment>
                      )
                    })}
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
              <div className="flex-1 text-right">{config?.timezone || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">IP地址</div>
              <div className="flex-1 text-right">{config?.ip || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">地理位置</div>
              <div className="flex-1 text-right">
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

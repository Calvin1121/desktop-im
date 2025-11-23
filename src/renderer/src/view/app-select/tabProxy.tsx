import React, { useEffect, useMemo, useState } from 'react'
import {
  FieldType,
  ipRules,
  ipTypeRules,
  portRules,
  ProxyConfig,
  ProxyConfigSection,
  ProxyConfigType
} from './tabProxy.config'
import { Button, Checkbox, Form, Input, Select, Space } from 'antd'
import { IProxyTabConfig } from 'src/model/type'
import _ from 'lodash'

interface Props {
  config?: IProxyTabConfig
  onCancel: () => void
  onConfirm: (config: IProxyTabConfig, isManual?: boolean) => void
}
const TabProxy: React.FC<Props> = React.memo((props: Props) => {
  const { onCancel, onConfirm, config: configProps } = props
  const [configs] = useState<ProxyConfigType>(ProxyConfig)
  const [form] = Form.useForm()
  const serveValue = Form.useWatch('serve', form)
  const userAgent = Form.useWatch('agent', form)
  const isServe = useMemo(() => serveValue ?? configProps?.serve, [configProps?.serve, serveValue])
  const onGenUserAgent = async () => {
    const value = form.getFieldValue('system')
    const agent = await window.api.genUserAgent(value)
    form.setFieldsValue({ agent })
  }
  const onSuffixClick = (section: ProxyConfigSection) => {
    if (section.key === 'agent') onGenUserAgent()
  }
  useEffect(() => {
    if (!serveValue) {
      form.setFields([
        { name: 'ip', errors: [] },
        { name: 'type', errors: [] },
        { name: 'port', errors: [] }
      ])
    }
  }, [form, serveValue])
  const onFinish = async (values: any) => {
    onConfirm(values, !!values)
  }
  const onDisabled = (section) => {
    if (section.key === 'ip' || section.key === 'port') {
      return !isServe
    }
    return false
  }
  const onRules = (section) => {
    if (section.key === 'ip' && isServe) return ipRules
    if (section.key === 'type' && isServe) return ipTypeRules
    if (section.key === 'port' && isServe) return portRules
    return []
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
              <div className="flex-1 text-right">{userAgent || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">时区</div>
              <div className="flex-1 text-right">{configProps?.timezone || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">IP地址</div>
              <div className="flex-1 text-right">{configProps?.ip || '-'}</div>
            </div>
            <div className="flex items-start !mb-2">
              <div className="w-24">地理位置</div>
              <div className="flex-1 text-right">
                <>{configProps?.country || '-'}</>
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

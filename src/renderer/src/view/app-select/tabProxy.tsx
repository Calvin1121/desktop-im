/* eslint-disable react/prop-types */
import React, { useCallback, useEffect } from 'react'
import { FieldType, ProxyConfig, ProxyConfigSection } from './tabProxy.config'
import { Button, Checkbox, Form, Input, Select, Space } from 'antd'

interface Props {
  onCancel: () => void
}

export default function TabProxy(props: Props) {
  const [form] = Form.useForm()
  const onGenUserAgent = useCallback(
    async (key: string) => {
      const value = form.getFieldValue('system')
      const ua = await window.api.genUserAgent(value)
      form.setFieldValue(key, ua)
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
    console.log(values)
  }
  useEffect(() => {
    const agent = window.navigator.userAgent
    form.setFieldsValue({ agent })
    window.api.callAPI('https://ipwho.org/me').then((res) => {
      console.log(res)
    })
  }, [form])
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
      <div className="!font-semibold py-1 border-b-[1px] border-[#ccc]">代理设置</div>
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
                <Button onClick={props.onCancel} htmlType="button">
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
          <div className="!font-semibold py-1 border-b-[1px] border-[#ccc]">指纹预览</div>
        </div>
      </div>
    </div>
  )
}

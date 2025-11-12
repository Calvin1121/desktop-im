import { useLogin } from '@renderer/api/login'
import { useMainStates } from '@renderer/main.provider'
import { useNavigate } from '@tanstack/react-router'
import { Button, Form, Input } from 'antd'

export default function Login() {
  const { updateStates } = useMainStates()
  const navigate = useNavigate()
  const { isMutating, trigger: onLogin } = useLogin()
  const onFinish = async (values) => {
    const loginInfo = await onLogin(values)
    if (loginInfo) {
      updateStates({ loginInfo })
      navigate({ to: '/', replace: true })
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Form
        className="!w-64 !pt-4 !px-4"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        name="loginForm"
        onFinish={onFinish}
      >
        <Form.Item label="邀请码" name="code" rules={[{ required: true, message: '请输入邀请码' }]}>
          <Input />
        </Form.Item>
        <Form.Item label={null}>
          <Button loading={isMutating} type="primary" htmlType="submit">
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

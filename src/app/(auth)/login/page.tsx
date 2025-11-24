// app/(auth)/login/page.tsx
'use client'

import { useLogin } from '@/hooks/auth/useLogin'
import { Form, Input, Button, Card } from 'antd'
import { motion } from 'framer-motion'

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const loginMutation = useLogin()
  const [form] = Form.useForm<LoginFormValues>()

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values) 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Đăng nhập</h1>
            <p className="text-muted-foreground text-base mt-2">
              Vui lòng nhập thông tin để tiếp tục
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={onSubmit} className="space-y-4">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email không được để trống' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input type="email" placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Mật khẩu không được để trống' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="••••••" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginMutation.isPending}
                className="w-full"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  )
}
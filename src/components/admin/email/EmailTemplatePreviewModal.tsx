// src/components/admin/email/EmailTemplatePreviewModal.tsx
'use client'

import { Modal, Form, Input, Button, Card, Typography, Space, Alert, message } from 'antd'
import { useState, useEffect } from 'react'
import { usePreviewEmailTemplate } from '@/hooks/email/usePreviewEmailTemplate'
import type { EmailTemplate } from '@/types/email.type'

const { Title, Paragraph } = Typography
const { TextArea } = Input

interface Props {
  open: boolean
  onClose: () => void
  template: EmailTemplate | null
}

export function EmailTemplatePreviewModal({ open, onClose, template }: Props) {
  const [form] = Form.useForm()
  const [previewData, setPreviewData] = useState<any>(null)
  const { mutateAsync: previewTemplate, isPending } = usePreviewEmailTemplate()

  useEffect(() => {
    if (template && open) {
      // Set default variables based on template variables
      const defaultVars = template.variables ? 
        Object.keys(template.variables).reduce((acc, key) => {
          acc[key] = `[Giá trị của ${key}]`
          return acc
        }, {} as Record<string, string>) : {}
      
      form.setFieldsValue({ variables: defaultVars })
      setPreviewData(null)
    }
  }, [template, open, form])

  const handlePreview = async (values: any) => {
    if (!template) return

    try {
      const result = await previewTemplate({
        templateId: template.id,
        variables: values.variables
      })
      setPreviewData(result.preview)
      message.success('Preview template thành công')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Preview thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    setPreviewData(null)
    onClose()
  }

  if (!template) return null

  return (
    <Modal
      title="Preview Email Template"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1000}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variables Input */}
        <Card title="Nhập giá trị biến" size="small">
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePreview}
          >
            {template.variables && Object.keys(template.variables).length > 0 ? (
              Object.entries(template.variables).map(([key, description]) => (
                <Form.Item
                  key={key}
                  name={['variables', key]}
                  label={
                    <span>
                      <code>{'{{' + key + '}}'}</code>
                      <div className="text-gray-500 text-sm">{String(description)}</div>
                    </span>
                  }
                >
                  <Input placeholder={`Nhập giá trị cho ${key}`} />
                </Form.Item>
              ))
            ) : (
              <Alert
                message="Không có biến được định nghĩa"
                description="Template này không sử dụng biến động"
                type="info"
                showIcon
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Xem Preview
              </Button>
            </div>
          </Form>
        </Card>

        {/* Preview Result */}
        <Card title="Kết quả Preview" size="small">
          {previewData ? (
            <Space direction="vertical" className="w-full">
              <div>
                <strong>Tiêu đề:</strong>
                <Paragraph className="mt-1 bg-blue-50 p-2 rounded">
                  {previewData.subject}
                </Paragraph>
              </div>
              
              <div>
                <strong>Nội dung:</strong>
                <div 
                  className="mt-2 p-4 bg-gray-50 rounded border whitespace-pre-wrap"
                  style={{ minHeight: '200px' }}
                >
                  {previewData.content}
                </div>
              </div>

              <Alert
                message="Đây là preview"
                description="Nội dung thực tế có thể khác khi gửi email thật"
                type="warning"
                showIcon
              />
            </Space>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Nhập giá trị biến và nhấn "Xem Preview" để xem kết quả
            </div>
          )}
        </Card>
      </div>
    </Modal>
  )
}
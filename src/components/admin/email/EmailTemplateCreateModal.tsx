// src/components/admin/email/EmailTemplateCreateModal.tsx
'use client'

import { Modal, Form, Input, Select, Switch, Button, message, Row, Col, Alert } from 'antd'
import { useState } from 'react'
import { useCreateEmailTemplate } from '@/hooks/email/useCreateEmailTemplate'

const { Option } = Select
const { TextArea } = Input

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export function EmailTemplateCreateModal({ open, onClose, refetch }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: createEmailTemplate, isPending } = useCreateEmailTemplate()
  const [showVariables, setShowVariables] = useState(false)

  const handleSubmit = async (values: any) => {
    try {
      await createEmailTemplate({
        ...values,
        variables: values.variables ? JSON.parse(values.variables) : undefined,
      })
      message.success('Tạo email template thành công')
      refetch?.()
      onClose()
      form.resetFields()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạo template thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    setShowVariables(false)
    onClose()
  }

  const defaultVariables = {
    "shareholderName": "Tên cổ đông",
    "meetingName": "Tên cuộc họp", 
    "meetingDate": "Ngày họp",
    "meetingTime": "Giờ họp",
    "meetingLocation": "Địa điểm",
    "verificationCode": "Mã xác thực",
    "registrationType": "Hình thức tham dự",
    "companyName": "Tên công ty"
  }

  return (
    <Modal
      title="Tạo Email Template Mới"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          category: 'SYSTEM',
          language: 'vi',
          isActive: true
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên template"
              rules={[
                { required: true, message: 'Vui lòng nhập tên template' },
                { min: 3, message: 'Tên template phải có ít nhất 3 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên template" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                <Option value="REGISTRATION">Đăng ký</Option>
                <Option value="ATTENDANCE">Điểm danh</Option>
                </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="subject"
          label="Tiêu đề email"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề email' }]}
        >
          <Input placeholder="Nhập tiêu đề email" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung email"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung email' }]}
        >
          <TextArea 
            rows={8} 
            placeholder="Nhập nội dung email. Sử dụng {{variable}} để chèn biến."
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea 
            rows={2} 
            placeholder="Mô tả về mục đích sử dụng của template này" 
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="language"
              label="Ngôn ngữ"
            >
              <Select placeholder="Chọn ngôn ngữ">
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
            </Form.Item>
          </Col>
        </Row>

        {/* Variables Section */}
        <Alert
          message={
            <span>
              Biến template - 
              <Button 
                type="link" 
                size="small" 
                onClick={() => setShowVariables(!showVariables)}
              >
                {showVariables ? 'Ẩn' : 'Hiển thị'} danh sách biến
              </Button>
            </span>
          }
          description="Sử dụng {{tên_biến}} trong nội dung để tự động thay thế giá trị"
          type="info"
          showIcon
          className="mb-4"
        />

        {showVariables && (
          <Form.Item
            name="variables"
            label="Biến mẫu (JSON)"
            extra="Định nghĩa các biến mẫu có thể sử dụng trong template"
          >
            <TextArea 
              rows={4}
              placeholder={JSON.stringify(defaultVariables, null, 2)}
            />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo Template
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
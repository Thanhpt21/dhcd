// src/components/admin/email/EmailTemplateDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Card, Typography, Space, Alert } from 'antd'
import type { EmailTemplate } from '@/types/email.type'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography

interface Props {
  open: boolean
  onClose: () => void
  template: EmailTemplate | null
}

export function EmailTemplateDetailModal({ open, onClose, template }: Props) {
  if (!template) return null

  const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    REGISTRATION: 'blue',
    ATTENDANCE: 'green',
  }
  return colors[category] || 'default'
}

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Vô hiệu hóa'
  }

  return (
    <Modal
      title="Chi Tiết Email Template"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Tên template" span={2}>
              <strong>{template.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              <Tag color={getCategoryColor(template.category)}>
                {template.category}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(template.isActive)}>
                {getStatusText(template.isActive)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngôn ngữ">
              <Tag>{template.language.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(template.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {dayjs(template.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            {template.description && (
              <Descriptions.Item label="Mô tả" span={2}>
                {template.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Email Content */}
        <Card title="Nội dung email" size="small">
          <Space direction="vertical" className="w-full">
            <div>
              <strong>Tiêu đề:</strong>
              <Paragraph className="mt-1">{template.subject}</Paragraph>
            </div>
            
            <div>
              <strong>Nội dung:</strong>
              <div 
                className="mt-2 p-4 bg-gray-50 rounded border"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {template.content}
              </div>
            </div>
          </Space>
        </Card>

        {/* Variables Info */}
        {template.variables && Object.keys(template.variables).length > 0 && (
          <Card title="Biến template" size="small">
            <Alert
              message="Các biến có thể sử dụng trong template"
              description="Sử dụng {{tên_biến}} trong nội dung để tự động thay thế"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Descriptions column={2} bordered size="small">
              {Object.entries(template.variables).map(([key, value]) => (
                <Descriptions.Item key={key} label={`{{${key}}}`}>
                  {String(value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Usage Instructions */}
        <Card title="Hướng dẫn sử dụng" size="small">
          <Space direction="vertical" className="w-full">
            <Alert
              message="Cách sử dụng biến trong template"
              description={
                <div>
                  <ul className="list-disc pl-4 mt-2">
                    <li>Sử dụng cú pháp <code>{'{{tên_biến}}'}</code> để chèn biến</li>
                    <li>Ví dụ: <code>Chào {'{{shareholderName}}'}</code></li>
                    <li>Biến sẽ được thay thế bằng giá trị thực tế khi gửi email</li>
                  </ul>
                </div>
              }
              type="info"
            />
          </Space>
        </Card>
      </div>
    </Modal>
  )
}
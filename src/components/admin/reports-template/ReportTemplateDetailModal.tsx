'use client'

import { Modal, Descriptions, Tag, Card, Typography, Space } from 'antd'
import type { ReportTemplate } from '@/types/report.type'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography

interface Props {
  open: boolean
  onClose: () => void
  template: ReportTemplate | null
}

export function ReportTemplateDetailModal({ open, onClose, template }: Props) {
  if (!template) return null

  // Map các loại báo cáo sang tiếng Việt
  const reportTypeLabels: Record<string, string> = {
  'ATTENDANCE_REPORT': 'Báo Cáo Điểm Danh',
  'VOTING_RESULTS': 'Kết Quả Bỏ Phiếu',
  'REGISTRATION_STATS': 'Thống Kê Đăng Ký',
  'QUESTION_ANALYTICS': 'Phân Tích Câu Hỏi',
  'SHAREHOLDER_ANALYSIS': 'Báo Cáo Cổ Đông'
}

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ATTENDANCE_REPORT': 'green',
      'VOTING_RESULTS': 'orange',
      'REGISTRATION_STATS': 'purple',
      'QUESTION_ANALYTICS': 'cyan',
      'SHAREHOLDER_ANALYSIS': 'magenta'
    }
    return colors[type] || 'default'
  }

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'PDF': 'red',
      'EXCEL': 'green',
      'CSV': 'blue',
      'HTML': 'orange'
    }
    return colors[format] || 'default'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Vô hiệu hóa'
  }

  return (
    <Modal
      title="Chi Tiết Mẫu Báo Cáo"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên mẫu báo cáo">
              <strong>{template.templateName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Loại báo cáo">
              <Tag color={getTypeColor(template.templateType)}>
                {reportTypeLabels[template.templateType] || template.templateType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Định dạng đầu ra">
              <Tag color={getFormatColor(template.outputFormat)}>
                {template.outputFormat}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(template.isActive)}>
                {getStatusText(template.isActive)}
              </Tag>
            </Descriptions.Item>
            {template.templateFile && (
              <Descriptions.Item label="File template">
                <Tag color="blue">
                  {template.templateFile}
                </Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {dayjs(template.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {dayjs(template.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin sử dụng */}
        <Card title="Thông tin sử dụng" size="small">
          <Space direction="vertical" className="w-full">
            <Paragraph>
              <strong>Mục đích:</strong> Mẫu báo cáo này được sử dụng để tạo báo cáo tự động cho các cuộc họp.
            </Paragraph>
            <Paragraph>
              <strong>Cách sử dụng:</strong> Chọn mẫu báo cáo này khi tạo báo cáo mới từ trang quản lý cuộc họp.
            </Paragraph>
            <Paragraph>
              <strong>Định dạng hỗ trợ:</strong> Báo cáo sẽ được xuất ra theo định dạng {template.outputFormat} và có thể tải về hoặc xem trực tuyến.
            </Paragraph>
          </Space>
        </Card>

        {/* Hướng dẫn bổ sung */}
        <Card title="Hướng dẫn bổ sung" size="small">
          <Space direction="vertical" className="w-full">
            <Paragraph>
              <strong>Khi nào sử dụng:</strong> Mẫu báo cáo này phù hợp cho việc tạo các báo cáo {reportTypeLabels[template.templateType]?.toLowerCase()} sau khi cuộc họp kết thúc hoặc trong quá trình diễn ra cuộc họp.
            </Paragraph>
            <Paragraph>
              <strong>Dữ liệu bao gồm:</strong> Báo cáo sẽ tự động thu thập và tổng hợp các dữ liệu liên quan từ hệ thống để tạo thành báo cáo hoàn chỉnh.
            </Paragraph>
          </Space>
        </Card>
      </div>
    </Modal>
  )
}
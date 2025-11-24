'use client'

import { Modal, Descriptions, Tag, Card, Typography, Space, Button } from 'antd'
import type { GeneratedReport } from '@/types/report.type'
import dayjs from 'dayjs'
import { DownloadOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface Props {
  open: boolean
  onClose: () => void
  report: GeneratedReport | null
}

export function GeneratedReportDetailModal({ open, onClose, report }: Props) {
  if (!report) return null

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'PDF': 'red',
      'EXCEL': 'green',
      'CSV': 'blue',
      'HTML': 'orange'
    }
    return colors[format] || 'default'
  }

  const handleDownload = () => {
    window.open(report.reportUrl, '_blank')
  }

  return (
    <Modal
      title="Chi Tiết Báo Cáo"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Tải Xuống
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={700}
    >
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card title="Thông tin báo cáo" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên báo cáo">
              <strong>{report.reportName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {report.meeting ? (
                <div>
                  <div><strong>{report.meeting.meetingName}</strong></div>
                  <div className="text-gray-500">Mã: {report.meeting.meetingCode}</div>
                </div>
              ) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Mẫu báo cáo">
              {report.template ? (
                <div>
                  <div><strong>{report.template.templateName}</strong></div>
                  <div className="text-gray-500">Loại: {report.template.templateType}</div>
                </div>
              ) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Định dạng">
              <Tag color={getFormatColor(report.reportFormat)}>
                {report.reportFormat}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {report.generatedByUser ? (
                <div>
                  <div><strong>{report.generatedByUser.name}</strong></div>
                  <div className="text-gray-500">{report.generatedByUser.email}</div>
                </div>
              ) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(report.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin file */}
        <Card title="Thông tin file" size="small">
          <Space direction="vertical" className="w-full">
            <Paragraph>
              <strong>URL báo cáo:</strong>{' '}
              <a href={report.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                {report.reportUrl}
              </a>
            </Paragraph>
            <Paragraph>
              <strong>Kích thước file:</strong> File sẽ được tải về khi nhấn nút "Tải Xuống"
            </Paragraph>
          </Space>
        </Card>

        {/* Hướng dẫn sử dụng */}
        <Card title="Hướng dẫn sử dụng" size="small">
          <Space direction="vertical" className="w-full">
            <Paragraph>
              <strong>Xem trước:</strong> Nhấn vào link URL để xem trước báo cáo trong trình duyệt.
            </Paragraph>
            <Paragraph>
              <strong>Tải về:</strong> Sử dụng nút "Tải Xuống" để lưu báo cáo về máy tính.
            </Paragraph>
            <Paragraph>
              <strong>Chia sẻ:</strong> Copy URL báo cáo để chia sẻ với người khác (nếu có quyền truy cập).
            </Paragraph>
          </Space>
        </Card>
      </div>
    </Modal>
  )
}
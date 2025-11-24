// src/components/admin/registration/RegistrationDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Spin, Empty, Button, Badge } from 'antd'
import type { Registration } from '@/types/registration.type'
import { 
  UserOutlined, 
  IdcardOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface RegistrationDetailModalProps {
  open: boolean
  onClose: () => void
  registration: Registration | null
}

export const RegistrationDetailModal = ({
  open,
  onClose,
  registration,
}: RegistrationDetailModalProps) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      APPROVED: 'blue',
      REJECTED: 'red',
      CANCELLED: 'gray'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      CANCELLED: 'Đã hủy'
    }
    return texts[status] || status
  }

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      IN_PERSON: 'Trực tiếp',
      ONLINE: 'Trực tuyến',
      PROXY: 'Ủy quyền',
      ABSENT: 'Vắng mặt'
    }
    return texts[type] || type
  }

  const getMethodText = (method: string) => {
    const texts: Record<string, string> = {
      QR_CODE: 'Quét QR Code',
      MANUAL: 'Thủ công',
      FACE_RECOGNITION: 'Nhận diện khuôn mặt'
    }
    return texts[method] || method
  }

  const formatDateTime = (dateString?: string) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY HH:mm') : '—'
  }


  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>Chi tiết đăng ký tham dự</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={700}
      destroyOnClose
    >
      {registration ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {registration.registrationCode}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color={getStatusColor(registration.status)}>
                    {getStatusText(registration.status)}
                  </Tag>
                  <Tag color="blue">{getTypeText(registration.registrationType)}</Tag>
                  {registration.checkinTime && (
                    <Tag color="green">
                      <CheckCircleOutlined /> Đã điểm danh
                    </Tag>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {registration.sharesRegistered.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">cổ phần đăng ký</div>
              </div>
            </div>
          </div>

          {/* Meeting & Shareholder Info */}
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Cuộc họp" span={2}>
              {registration.meeting?.meetingName || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Cổ đông" span={2}>
              <div className="flex items-center gap-1">
                <UserOutlined />
                <span>
                  {registration.shareholder?.fullName} 
                  ({registration.shareholder?.shareholderCode})
                </span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Số CMND/CCCD">
              <div className="flex items-center gap-1">
                <IdcardOutlined />
                <span>{registration.shareholder?.idNumber}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng cổ phần">
              {registration.shareholder?.totalShares.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          {/* Registration Details */}
          <Descriptions column={2} bordered size="small" title="Thông tin đăng ký">
            <Descriptions.Item label="Ngày đăng ký">
              {formatDateTime(registration.registrationDate)}
            </Descriptions.Item>

            <Descriptions.Item label="Hình thức tham dự">
              {getTypeText(registration.registrationType)}
            </Descriptions.Item>

            <Descriptions.Item label="Thời điểm điểm danh">
              {formatDateTime(registration.checkinTime)}
            </Descriptions.Item>

            <Descriptions.Item label="Phương thức điểm danh">
              {registration.checkinMethod ? getMethodText(registration.checkinMethod) : '—'}
            </Descriptions.Item>
          </Descriptions>

          {/* Proxy Information */}
          {registration.registrationType === 'PROXY' && (
            <Descriptions column={1} bordered size="small" title="Thông tin ủy quyền">
              <Descriptions.Item label="Người được ủy quyền">
                {registration.proxyName || '—'}
              </Descriptions.Item>

              <Descriptions.Item label="Mối quan hệ">
                {registration.proxyRelationship || '—'}
              </Descriptions.Item>

              <Descriptions.Item label="File giấy ủy quyền">
                {registration.proxyDocumentUrl ? (
                  <a href={registration.proxyDocumentUrl} target="_blank" rel="noopener noreferrer">
                    Xem file
                  </a>
                ) : '—'}
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* Notes */}
          {registration.notes && (
            <Descriptions column={1} bordered size="small" title="Ghi chú">
              <Descriptions.Item>
                {registration.notes}
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* Timestamps */}
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(registration.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDateTime(registration.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin đăng ký" />
      )}
    </Modal>
  )
}
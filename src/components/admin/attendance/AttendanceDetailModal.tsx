// src/components/admin/attendance/AttendanceDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Empty, Button, Badge } from 'antd'
import type { Attendance } from '@/types/attendance.type'
import { 
  UserOutlined, 
  CalendarOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface AttendanceDetailModalProps {
  open: boolean
  onClose: () => void
  attendance: Attendance | null
}

export const AttendanceDetailModal = ({
  open,
  onClose,
  attendance,
}: AttendanceDetailModalProps) => {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      QR_CODE: 'blue',
      MANUAL: 'orange',
      FACE_RECOGNITION: 'green'
    }
    return colors[method] || 'default'
  }

  const getMethodText = (method: string) => {
    const texts: Record<string, string> = {
      QR_CODE: 'Quét QR Code',
      MANUAL: 'Thủ công',
    }
    return texts[method] || method
  }

  const formatDateTime = (dateString?: string) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY HH:mm') : '—'
  }

  const getDuration = (checkinTime: string, checkoutTime?: string) => {
    const endTime = checkoutTime ? dayjs(checkoutTime) : dayjs()
    const duration = endTime.diff(dayjs(checkinTime), 'minute')
    
    if (duration < 60) {
      return `${duration} phút`
    } else {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${hours} giờ ${minutes} phút`
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>Chi tiết điểm danh</span>
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
      {attendance ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {attendance.shareholder?.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color={attendance.checkoutTime ? 'gray' : 'green'}>
                    {attendance.checkoutTime ? 'Đã checkout' : 'Đang tham dự'}
                  </Tag>
                  <Tag color={getMethodColor(attendance.checkinMethod)}>
                    {getMethodText(attendance.checkinMethod)}
                  </Tag>
                  {!attendance.checkoutTime && (
                    <Badge status="processing" text="Online" />
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {attendance.shareholder?.totalShares.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">cổ phần</div>
              </div>
            </div>
          </div>

          {/* Meeting & Shareholder Info */}
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Cuộc họp" span={2}>
              {attendance.meeting?.meetingName || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Cổ đông" span={2}>
              <div className="flex items-center gap-1">
                <UserOutlined />
                <span>
                  {attendance.shareholder?.fullName} 
                  ({attendance.shareholder?.shareholderCode})
                </span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {attendance.shareholder?.email || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Tổng cổ phần">
              {attendance.shareholder?.totalShares.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          {/* Attendance Details */}
          <Descriptions column={2} bordered size="small" title="Thông tin điểm danh">
            <Descriptions.Item label="Thời gian check-in">
              <div className="flex items-center gap-1">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>{formatDateTime(attendance.checkinTime)}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian check-out">
              <div className="flex items-center gap-1">
                {attendance.checkoutTime ? (
                  <>
                    <LogoutOutlined style={{ color: '#fa8c16' }} />
                    <span>{formatDateTime(attendance.checkoutTime)}</span>
                  </>
                ) : (
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Phương thức">
              {getMethodText(attendance.checkinMethod)}
            </Descriptions.Item>

            <Descriptions.Item label="Thời lượng tham dự">
              {getDuration(attendance.checkinTime, attendance.checkoutTime)}
            </Descriptions.Item>
          </Descriptions>

          {/* Technical Info */}
          {(attendance.ipAddress || attendance.userAgent) && (
            <Descriptions column={1} bordered size="small" title="Thông tin kỹ thuật">
              {attendance.ipAddress && (
                <Descriptions.Item label="Địa chỉ IP">
                  {attendance.ipAddress}
                </Descriptions.Item>
              )}
              {attendance.userAgent && (
                <Descriptions.Item label="Thiết bị">
                  {attendance.userAgent}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* Notes */}
          {attendance.notes && (
            <Descriptions column={1} bordered size="small" title="Ghi chú">
              <Descriptions.Item>
                {attendance.notes}
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* Timestamps */}
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(attendance.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin điểm danh" />
      )}
    </Modal>
  )
}
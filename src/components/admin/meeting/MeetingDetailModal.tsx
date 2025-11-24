// src/components/admin/meeting/MeetingDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Spin, Empty, Button } from 'antd'
import { useMeetingOne } from '@/hooks/meeting/useMeetingOne'
import type { Meeting } from '@/types/meeting.type'
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  UserOutlined, 
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MeetingStatus } from '@/enums/meeting.enum'

interface MeetingDetailModalProps {
  open: boolean
  onClose: () => void
  meetingId: number | null
}

export const MeetingDetailModal = ({
  open,
  onClose,
  meetingId,
}: MeetingDetailModalProps) => {
  const { data: meeting, isLoading } = useMeetingOne(meetingId || 0)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'default',
      SCHEDULED: 'blue',
      ONGOING: 'orange',
      COMPLETED: 'green',
      CANCELLED: 'red'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: MeetingStatus) => {
    const statusMap: Record<string, string> = {
      DRAFT: 'Nháp',
      SCHEDULED: 'Đã lên lịch',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const getMeetingTypeText = (type: MeetingStatus) => {
    const types: Record<string, string> = {
      AGM: 'Đại hội đồng cổ đông thường niên',
      EGM: 'Đại hội đồng cổ đông bất thường',
      BOARD: 'Họp hội đồng quản trị',
      SHAREHOLDER: 'Họp cổ đông',
      ANNUAL_GENERAL: 'Đại hội thường niên'
    }
    return types[type] || type
  }

  const getVotingMethodText = (method: string) => {
    const methods: Record<string, string> = {
      YES_NO: 'Có/Không',
      MULTIPLE_CHOICE: 'Nhiều lựa chọn',
      SINGLE_CHOICE: 'Một lựa chọn'
    }
    return methods[method] || method
  }

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  if (!meetingId) {
    return null
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>Chi tiết cuộc họp</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={800}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : meeting ? (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {meeting.meetingName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color="blue">{meeting.meetingCode}</Tag>
                  <Tag color={getStatusColor(meeting.status)}>
                    {getStatusText(meeting.status)}
                  </Tag>
                  <Tag color="purple">{getMeetingTypeText(meeting.meetingType)}</Tag>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Người tạo</div>
                <div className="font-medium">
                  {meeting.createdByUser?.name || 'Không có thông tin'}
                </div>
              </div>
            </div>
          </div>

          <Descriptions column={2} bordered size="small">
            {/* Thông tin cơ bản */}
            <Descriptions.Item label="Ngày giờ họp" span={2}>
              <div className="flex items-center gap-1">
                <CalendarOutlined />
                <span>{formatDateTime(meeting.meetingDate)}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Địa điểm">
              <div className="flex items-center gap-1">
                <EnvironmentOutlined />
                <span>{meeting.meetingLocation || '—'}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ chi tiết">
              {meeting.meetingAddress || '—'}
            </Descriptions.Item>

            {/* Thời gian đăng ký */}
            <Descriptions.Item label="Bắt đầu đăng ký" span={2}>
              {meeting.registrationStart ? (
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>{formatDateTime(meeting.registrationStart)}</span>
                </div>
              ) : (
                '—'
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Kết thúc đăng ký" span={2}>
              {meeting.registrationEnd ? (
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>{formatDateTime(meeting.registrationEnd)}</span>
                </div>
              ) : (
                '—'
              )}
            </Descriptions.Item>

            {/* Thời gian bỏ phiếu */}
            <Descriptions.Item label="Bắt đầu bỏ phiếu" span={2}>
              {meeting.votingStart ? (
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>{formatDateTime(meeting.votingStart)}</span>
                </div>
              ) : (
                '—'
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Kết thúc bỏ phiếu" span={2}>
              {meeting.votingEnd ? (
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>{formatDateTime(meeting.votingEnd)}</span>
                </div>
              ) : (
                '—'
              )}
            </Descriptions.Item>

            {/* Thống kê */}
            <Descriptions.Item label="Tổng số cổ đông">
              <div className="flex items-center gap-1">
                <UserOutlined />
                <span>{meeting.totalShareholders.toLocaleString()}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng số cổ phần">
              <div className="flex items-center gap-1">
                <BarChartOutlined />
                <span>{meeting.totalShares.toLocaleString()}</span>
              </div>
            </Descriptions.Item>

            {/* Mô tả */}
            <Descriptions.Item label="Mô tả" span={2}>
              {meeting.description || '—'}
            </Descriptions.Item>

            {/* Timestamps */}
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(meeting.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDateTime(meeting.updatedAt)}
            </Descriptions.Item>
          </Descriptions>

          {/* Thông tin liên quan */}
          {meeting.resolutions && meeting.resolutions.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Nghị quyết ({meeting.resolutions.length})</h3>
              <div className="space-y-3">
                {meeting.resolutions.slice(0, 3).map((resolution: any) => (
                  <div key={resolution.id} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{resolution.title}</span>
                      <Tag >{getVotingMethodText(resolution.votingMethod)}</Tag>
                    </div>
                    <div className="text-sm text-gray-600">
                      Mã: {resolution.resolutionCode} • Số: {resolution.resolutionNumber}
                    </div>
                  </div>
                ))}
                {meeting.resolutions.length > 3 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{meeting.resolutions.length - 3} nghị quyết khác
                  </div>
                )}
              </div>
            </div>
          )}

          {meeting.agendas && meeting.agendas.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Chương trình nghị sự ({meeting.agendas.length})</h3>
              <div className="space-y-2">
                {meeting.agendas.slice(0, 3).map((agenda: any, index: number) => (
                  <div key={agenda.id} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{agenda.title}</span>
                  </div>
                ))}
                {meeting.agendas.length > 3 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{meeting.agendas.length - 3} mục khác
                  </div>
                )}
              </div>
            </div>
          )}

          {meeting.documents && meeting.documents.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Tài liệu ({meeting.documents.length})</h3>
              <div className="space-y-2">
                {meeting.documents.slice(0, 3).map((document: any) => (
                  <div key={document.id} className="text-sm">
                    📄 {document.title}
                  </div>
                ))}
                {meeting.documents.length > 3 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{meeting.documents.length - 3} tài liệu khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin cuộc họp" />
      )}
    </Modal>
  )
}
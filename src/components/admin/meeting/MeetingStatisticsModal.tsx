// src/components/admin/meeting/MeetingStatisticsModal.tsx
'use client'

import { Modal, Statistic, Row, Col, Card, Tag } from 'antd'
import { useMeetingStatistics } from '@/hooks/meeting/useMeetingStatistics'
import type { Meeting } from '@/types/meeting.type'

interface MeetingStatisticsModalProps {
  open: boolean
  onClose: () => void
  meeting: Meeting | null
}

export const MeetingStatisticsModal = ({
  open,
  onClose,
  meeting,
}: MeetingStatisticsModalProps) => {
  const { data: statistics, isLoading } = useMeetingStatistics(
    meeting?.id || 0,
    { enabled: open && !!meeting }
  )

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: 'Nháp',
      SCHEDULED: 'Đã lên lịch',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã hủy'
    }
    return statusMap[status] || status
  }

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

  return (
    <Modal
      title={`Thống kê - ${meeting?.meetingName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {meeting && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Tag color="blue">{meeting.meetingCode}</Tag>
              <span className="ml-2 text-gray-600">
                {new Date(meeting.meetingDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Trạng thái</div>
              <Tag 
                color={getStatusColor(meeting.status)}
              >
                {getStatusText(meeting.status)}
              </Tag>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng đăng ký"
                  value={statistics?.totalRegistrations || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tham dự"
                  value={statistics?.totalAttendances || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ tham dự"
                  value={statistics?.attendanceRate || 0}
                  precision={1}
                  suffix="%"
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Câu hỏi"
                  value={statistics?.totalQuestions || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Phản hồi"
                  value={statistics?.totalFeedbacks || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Nghị quyết"
                  value={statistics?.totalResolutions || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng phiếu bầu"
                  value={statistics?.totalVotes || 0}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Cổ đông"
                  value={meeting.totalShareholders}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  )
}
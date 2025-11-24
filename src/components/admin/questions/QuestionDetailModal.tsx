// src/components/admin/questions/QuestionDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Empty, Button, Badge, Divider, Avatar } from 'antd'
import type { Question } from '@/types/question.type'
import { 
  UserOutlined, 
  CalendarOutlined,
  LikeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  MessageOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { QuestionStatus } from '@/enums/question.enum'

interface QuestionDetailModalProps {
  open: boolean
  onClose: () => void
  question: Question | null
}

export const QuestionDetailModal = ({
  open,
  onClose,
  question,
}: QuestionDetailModalProps) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: 'blue',
      FINANCIAL: 'green',
      OPERATIONAL: 'orange',
      STRATEGIC: 'purple',
      OTHER: 'gray'
    }
    return colors[type] || 'default'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'gray',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red'
    }
    return colors[priority] || 'default'
  }

  const getStatusColor = (status: QuestionStatus) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      UNDER_REVIEW: 'blue',
      ANSWERED: 'green',
      REJECTED: 'red',
      ARCHIVED: 'gray'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: QuestionStatus) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      UNDER_REVIEW: 'Đang xem xét',
      ANSWERED: 'Đã trả lời',
      REJECTED: 'Từ chối',
      ARCHIVED: 'Lưu trữ'
    }
    return texts[status] || status
  }

  const formatDateTime = (dateString?: string) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY HH:mm') : '—'
  }

  const formatShares = (shares?: number) => {
    return shares ? shares.toLocaleString() : '0'
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <MessageOutlined />
          <span>Chi tiết câu hỏi</span>
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
      {question ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {question.questionCode}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color={getStatusColor(question.status)}>
                    {getStatusText(question.status)}
                  </Tag>
                  <Tag color={getTypeColor(question.questionType)}>
                    {question.questionType}
                  </Tag>
                  <Tag color={getPriorityColor(question.priority)}>
                    {question.priority}
                  </Tag>
                  {question.isSelected && (
                    <Badge count={<StarOutlined style={{ color: '#fadb14' }} />}>
                      <Tag color="gold">Đã chọn</Tag>
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                  <LikeOutlined />
                  <span>{question.upvoteCount || 0}</span>
                </div>
                <div className="text-sm text-gray-500">lượt upvote</div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Nội dung câu hỏi:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{question.questionText}</p>
          </div>

          {/* Meeting & Shareholder Info */}
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Cuộc họp" span={2}>
              {question.meeting?.meetingName || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Cổ đông" span={2}>
              <div className="flex items-center gap-2">
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{question.shareholder?.fullName || '—'}</div>
                  <div className="text-xs text-gray-500">
                    {question.shareholder?.shareholderCode || '—'} • {formatShares(question.shareholder?.totalShares)} CP
                  </div>
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {question.shareholder?.email || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(question.createdAt)}
            </Descriptions.Item>
          </Descriptions>

          {/* Answer Section */}
          {question.answerText && (
            <>
              <Divider orientation="left">Câu trả lời</Divider>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-green-800">
                    Trả lời bởi: {question.answeredBy || 'Ban tổ chức'}
                  </h3>
                  {question.answeredAt && (
                    <div className="text-sm text-green-600">
                      {formatDateTime(question.answeredAt)}
                    </div>
                  )}
                </div>
                <p className="text-green-900 whitespace-pre-wrap">{question.answerText}</p>
              </div>
            </>
          )}

          {/* Admin Notes */}
          {question.adminNotes && (
            <>
              <Divider orientation="left">Ghi chú nội bộ</Divider>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 whitespace-pre-wrap">{question.adminNotes}</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin câu hỏi" />
      )}
    </Modal>
  )
}
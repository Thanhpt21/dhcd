// src/components/admin/questions/QuestionTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Card, Statistic, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, ExportOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useQuestions } from '@/hooks/question/useQuestions'
import { useUpvoteQuestion } from '@/hooks/question/useUpvoteQuestion'
import { useQuestionStatistics } from '@/hooks/question/useQuestionStatistics'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import type { Question, QuestionStatus, QuestionType } from '@/types/question.type'
import { QuestionUpdateModal } from './QuestionUpdateModal'
import { QuestionDetailModal } from './QuestionDetailModal'
import dayjs from 'dayjs'
import { useDeleteQuestion } from '@/hooks/question/useDeleteQuestion'

const { Option } = Select

export default function QuestionTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useQuestions({ 
    page, 
    limit: 10, 
    search, 
    meetingId: meetingIdFilter,
    status: statusFilter,
    questionType: typeFilter
  })

  const { data: statistics } = useQuestionStatistics(selectedMeetingId || 0)
  const { data: meetings, isLoading: isLoadingMeetings } = useAllMeetings()
  
  const { mutateAsync: deleteQuestion } = useDeleteQuestion()
  const { mutateAsync: upvoteQuestion } = useUpvoteQuestion()

  const getTypeColor = (type: QuestionType) => {
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

  const handleUpvote = async (questionId: number, shareholderId: number) => {
    try {
      await upvoteQuestion({ questionId, shareholderId })
      message.success('Upvote thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Upvote thất bại')
    }
  }

  const handleMeetingFilterChange = (meetingId: string) => {
    setMeetingIdFilter(meetingId)
    setSelectedMeetingId(meetingId ? Number(meetingId) : null)
    setPage(1)
  }

  const columns: ColumnsType<Question> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã câu hỏi',
      dataIndex: 'questionCode',
      key: 'questionCode',
      width: 120,
    },
    {
      title: 'Nội dung',
      dataIndex: 'questionText',
      key: 'questionText',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Cuộc họp',
      dataIndex: 'meeting',
      key: 'meeting',
      width: 150,
      render: (meeting: any) => meeting?.meetingName || '—',
      ellipsis: true,
    },
    {
      title: 'Cổ đông',
      dataIndex: 'shareholder',
      key: 'shareholder',
      width: 150,
      render: (shareholder: any) => (
        <div>
          <div className="font-medium">{shareholder?.fullName}</div>
          <div className="text-xs text-gray-500">{shareholder?.shareholderCode}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 120,
      render: (type: QuestionType) => (
        <Tag color={getTypeColor(type)}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: QuestionStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Upvote',
      dataIndex: 'upvoteCount',
      key: 'upvoteCount',
      width: 80,
      render: (count: number, record) => (
        <div className="flex items-center gap-1">
          <LikeOutlined style={{ color: '#1890ff' }} />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: 'Chọn',
      dataIndex: 'isSelected',
      key: 'isSelected',
      width: 80,
      render: (selected: boolean) => (
        selected ? <StarOutlined style={{ color: '#fadb14' }} /> : '—'
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedQuestion(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedQuestion(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Upvote">
            <LikeOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => handleUpvote(record.id, record.shareholderId)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa câu hỏi',
                  content: `Bạn có chắc chắn muốn xóa câu hỏi "${record.questionCode}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteQuestion(record.id)
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const handleReset = () => {
    setInputValue('')
    setSearch('')
    setMeetingIdFilter('')
    setStatusFilter('')
    setTypeFilter('')
    setSelectedMeetingId(null)
    setPage(1)
  }

  return (
    <div>
      {/* Statistics Card */}
      {selectedMeetingId && statistics && (
        <Card className="mb-4">
          <Row gutter={16}>
            <Col span={4}>
              <Statistic
                title="Tổng câu hỏi"
                value={statistics.totalQuestions}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Chờ xử lý"
                value={statistics.pendingQuestions}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đã trả lời"
                value={statistics.answeredQuestions}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Được chọn"
                value={statistics.selectedQuestions}
                valueStyle={{ color: '#fadb14' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Tổng upvote"
                value={statistics.totalUpvotes}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Tỷ lệ trả lời"
                value={((statistics.answeredQuestions / statistics.totalQuestions) * 100).toFixed(1)}
                suffix="%"
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã câu hỏi, nội dung, cổ đông..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Select
            placeholder="Chọn cuộc họp"
            value={meetingIdFilter || undefined}
            onChange={handleMeetingFilterChange}
            allowClear
            loading={isLoadingMeetings}
            style={{ width: 200 }}
          >
            {meetings?.map((meeting: any) => (
              <Option key={meeting.id} value={meeting.id.toString()}>
                {meeting.meetingName}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="PENDING">Chờ xử lý</Option>
            <Option value="UNDER_REVIEW">Đang xem xét</Option>
            <Option value="ANSWERED">Đã trả lời</Option>
            <Option value="REJECTED">Từ chối</Option>
            <Option value="ARCHIVED">Lưu trữ</Option>
          </Select>
          <Select
            placeholder="Loại câu hỏi"
            value={typeFilter || undefined}
            onChange={setTypeFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="GENERAL">Chung</Option>
            <Option value="FINANCIAL">Tài chính</Option>
            <Option value="OPERATIONAL">Vận hành</Option>
            <Option value="STRATEGIC">Chiến lược</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

      
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} câu hỏi`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1500 }}
      />



      <QuestionUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        question={selectedQuestion}
        refetch={refetch}
      />

      <QuestionDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        question={selectedQuestion}
      />
    </div>
  )
}
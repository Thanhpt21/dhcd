// src/components/admin/attendance/AttendanceTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Card, Statistic, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, ExportOutlined, LogoutOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAttendances } from '@/hooks/attendance/useAttendances'
import { useDeleteAttendance } from '@/hooks/attendance/useDeleteAttendance'
import { useCheckoutAttendance } from '@/hooks/attendance/useCheckoutAttendance'
import { useAttendanceStatistics } from '@/hooks/attendance/useAttendanceStatistics'
import { useExportAttendances } from '@/hooks/attendance/useExportAttendances'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import type { Attendance, CheckinMethod } from '@/types/attendance.type'
import { AttendanceCreateModal } from './AttendanceCreateModal'
import { AttendanceUpdateModal } from './AttendanceUpdateModal'
import { AttendanceDetailModal } from './AttendanceDetailModal'
import dayjs from 'dayjs'
import { AutoCheckoutAlert } from './AutoCheckoutAlert'

const { Option } = Select

export default function AttendanceTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [shareholderIdFilter, setShareholderIdFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useAttendances({ 
    page, 
    limit: 10, 
    search, 
    meetingId: meetingIdFilter,
    shareholderId: shareholderIdFilter
  })

  const { data: statistics } = useAttendanceStatistics(selectedMeetingId || 0)
  const { data: meetings, isLoading: isLoadingMeetings } = useAllMeetings()
  
  const { mutateAsync: deleteAttendance } = useDeleteAttendance()
  const { mutateAsync: checkoutAttendance } = useCheckoutAttendance()
  const { mutateAsync: exportAttendances, isPending: isExporting } = useExportAttendances()

  const getMethodColor = (method: CheckinMethod | string) => {
    const colors: Record<string, string> = {
      QR_CODE: 'blue',
      MANUAL: 'orange',
    }
    return colors[method] || 'default'
  }

  const getMethodText = (method: CheckinMethod | string) => {
    const texts: Record<string, string> = {
      QR_CODE: 'QR Code',
      MANUAL: 'Thủ công',
    }
    return texts[method] || method
  }

  const getStatusColor = (checkoutTime?: string) => {
    return checkoutTime ? 'gray' : 'green'
  }

  const getStatusText = (checkoutTime?: string) => {
    return checkoutTime ? 'Đã checkout' : 'Đang tham dự'
  }

  const handleCheckout = async (attendanceId: number) => {
    try {
      await checkoutAttendance(attendanceId)
      message.success('Checkout thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Checkout thất bại')
    }
  }

  const handleExport = async () => {
    if (!selectedMeetingId) {
      message.error('Vui lòng chọn cuộc họp để export')
      return
    }
    
    try {
      await exportAttendances(selectedMeetingId)
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Export thất bại')
    }
  }

  const handleMeetingFilterChange = (meetingId: string) => {
    setMeetingIdFilter(meetingId)
    setSelectedMeetingId(meetingId ? Number(meetingId) : null)
    setPage(1)
  }

  const columns: ColumnsType<Attendance> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Cuộc họp',
      dataIndex: 'meeting',
      key: 'meeting',
      render: (meeting: any) => meeting?.meetingName || '—',
      ellipsis: true,
    },
    {
      title: 'Cổ đông',
      dataIndex: 'shareholder',
      key: 'shareholder',
      render: (shareholder: any) => (
        <div>
          <div className="font-medium">{shareholder?.fullName}</div>
          <div className="text-xs text-gray-500">{shareholder?.shareholderCode}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian check-in',
      dataIndex: 'checkinTime',
      key: 'checkinTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian check-out',
      dataIndex: 'checkoutTime',
      key: 'checkoutTime',
      render: (time?: string) => time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Phương thức',
      dataIndex: 'checkinMethod',
      key: 'checkinMethod',
      render: (method: CheckinMethod | string) => (
        <Tag color={getMethodColor(method)}>
          {getMethodText(method)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.checkoutTime)}>
          {getStatusText(record.checkoutTime)}
        </Tag>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'detail',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedAttendance(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedAttendance(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa điểm danh',
                  content: `Bạn có chắc chắn muốn xóa điểm danh của cổ đông này không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteAttendance(record.id)
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
    setShareholderIdFilter('')
    setSelectedMeetingId(null)
    setPage(1)
  }

  return (
    <div>
      {/* Statistics Card */}
      {selectedMeetingId && statistics && (
        <Card className="mb-4">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Tổng điểm danh"
                value={statistics.totalAttendances}
                suffix={`/ ${statistics.totalRegistrations}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Tỷ lệ tham dự"
                value={statistics.attendanceRate}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Đang tham dự"
                value={statistics.stillPresent}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Tổng cổ phần"
                value={statistics.totalSharesPresent}
                formatter={value => value?.toLocaleString()}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên cổ đông, mã cổ đông..."
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
            style={{ width: 250 }}
          >
            {meetings?.map((meeting: any) => (
              <Option key={meeting.id} value={meeting.id.toString()}>
                {meeting.meetingName} ({dayjs(meeting.meetingDate).format('DD/MM/YYYY')})
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedMeetingId && (
            <Button 
              icon={<ExportOutlined />} 
              onClick={handleExport}
              loading={isExporting}
            >
              Export Excel
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
            Thêm điểm danh
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
          showTotal: (total) => `Tổng ${total} điểm danh`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1300 }}
      />

     {selectedMeetingId && (
        <AutoCheckoutAlert meetingId={selectedMeetingId} />
      )}

      <AttendanceCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <AttendanceUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        attendance={selectedAttendance}
        refetch={refetch}
      />

      <AttendanceDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        attendance={selectedAttendance}
      />
    </div>
  )
}
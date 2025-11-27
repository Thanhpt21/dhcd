// src/components/admin/meeting/MeetingTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, BarChartOutlined, SyncOutlined, CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, FileTextOutlined, AuditOutlined, CalendarOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useMeetings } from '@/hooks/meeting/useMeetings'
import { useDeleteMeeting } from '@/hooks/meeting/useDeleteMeeting'
import { useUpdateMeetingStatus } from '@/hooks/meeting/useUpdateMeetingStatus'
import type { Meeting, MeetingStatus } from '@/types/meeting.type'
import { MeetingCreateModal } from './MeetingCreateModal'
import { MeetingUpdateModal } from './MeetingUpdateModal'
import { MeetingStatisticsModal } from './MeetingStatisticsModal'
import { useRouter } from 'next/navigation'
import { MeetingDetailModal } from './MeetingDetailModal'

const { Option } = Select

// Interface cho real-time status
interface RealTimeMeeting extends Meeting {
  realTimeStatus?: {
    currentTime: string;
    meetingStartTime: string;
    meetingEndTime: string;
    timeUntilStart: number;
    timeUntilEnd: number;
    isStarted: boolean;
    isEnded: boolean;
    shouldBeStatus: string;
  };
}

export default function MeetingTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openStatistics, setOpenStatistics] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [meetingsData, setMeetingsData] = useState<RealTimeMeeting[]>([])
  const router = useRouter()

  const { data, isLoading, refetch } = useMeetings({ 
    page, 
    limit: 10, 
    search, 
    status: statusFilter 
  })
  const { mutateAsync: deleteMeeting } = useDeleteMeeting()
  const { mutateAsync: updateStatus } = useUpdateMeetingStatus()

  const [openDetail, setOpenDetail] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)

  // Auto refresh data mỗi 30 giây để cập nhật real-time status
  useEffect(() => {
    if (data?.data) {
      setMeetingsData(data.data as RealTimeMeeting[])
    }
  }, [data])

  // Tự động refetch mỗi 30 giây để cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      refetch?.()
    }, 30000) // 30 giây

    return () => clearInterval(interval)
  }, [refetch])

  const getStatusDisplay = (meeting: RealTimeMeeting) => {
    const now = new Date()
    const meetingDate = new Date(meeting.meetingDate)
    
    // Tính toán real-time status
    let displayStatus = meeting.status
    let statusColor = getStatusColor(meeting.status)
    let icon = null
    let badge = false

    if (meeting.status === 'SCHEDULED' && now >= meetingDate) {
      displayStatus = 'ĐANG DIỄN RA'
      statusColor = 'orange'
      icon = <SyncOutlined spin />
      badge = true
    } else if (meeting.status === 'ONGOING') {
      displayStatus = 'ĐANG DIỄN RA'
      statusColor = 'orange'
      icon = <PlayCircleOutlined />
      badge = true
    } else if (meeting.status === 'COMPLETED') {
      displayStatus = 'ĐÃ HOÀN THÀNH'
      statusColor = 'green'
      icon = <CheckCircleOutlined />
    } else if (meeting.status === 'SCHEDULED') {
      displayStatus = 'ĐÃ LÊN LỊCH'
      statusColor = 'blue'
      icon = <ClockCircleOutlined />
    } else if (meeting.status === 'DRAFT') {
      displayStatus = 'NHÁP'
      statusColor = 'default'
      icon = <PauseCircleOutlined />
    } else if (meeting.status === 'CANCELLED') {
      displayStatus = 'ĐÃ HỦY'
      statusColor = 'red'
      icon = <PauseCircleOutlined />
    }

    return (
      <Space>
        {badge ? (
          <Badge dot status="processing" color={statusColor}>
            <Tag color={statusColor} icon={icon}>
              {displayStatus}
            </Tag>
          </Badge>
        ) : (
          <Tag color={statusColor} icon={icon}>
            {displayStatus}
          </Tag>
        )}
        
        {/* Hiển thị countdown nếu là SCHEDULED */}
        {meeting.status === 'SCHEDULED' && now < meetingDate && (
          <Tooltip title={`Sẽ bắt đầu lúc ${meetingDate.toLocaleString('vi-VN')}`}>
            <span className="text-xs text-gray-500">
              {Math.ceil((meetingDate.getTime() - now.getTime()) / (1000 * 60))}p
            </span>
          </Tooltip>
        )}
      </Space>
    )
  }

  const getStatusColor = (status: MeetingStatus | string) => {
    const colors: Record<string, string> = {
      DRAFT: 'default',
      SCHEDULED: 'blue',
      ONGOING: 'orange',
      COMPLETED: 'green',
      CANCELLED: 'red'
    }
    return colors[status] || 'default'
  }

  const getMeetingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      AGM: 'purple',
      EGM: 'cyan',
      BOARD: 'gold',
      SHAREHOLDER: 'green'
    }
    return colors[type] || 'default'
  }

  const handleStatusChange = async (meetingId: number, newStatus: string) => {
    try {
      await updateStatus({ id: meetingId, status: newStatus })
      message.success('Cập nhật trạng thái thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const columns: ColumnsType<RealTimeMeeting> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã cuộc họp',
      dataIndex: 'meetingCode',
      key: 'meetingCode',
      width: 150,
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Tên cuộc họp',
      dataIndex: 'meetingName',
      key: 'meetingName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'meetingType',
      key: 'meetingType',
      width: 120,
      render: (type: string) => (
        <Tag color={getMeetingTypeColor(type)}>
          {type === 'AGM' ? 'ĐHCĐ Thường niên' : 
           type === 'EGM' ? 'ĐHCĐ Bất thường' : 
           type === 'BOARD' ? 'Họp HĐQT' : 'Họp cổ đông'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian họp',
      key: 'meetingDateTime',
      width: 140,
      render: (_, record: RealTimeMeeting) => (
        <Space direction="vertical" size="small" className="text-sm">
          <div className="flex items-center gap-1">
            <CalendarOutlined className="text-gray-400" />
            <span>{new Date(record.meetingDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <ClockCircleOutlined className="text-gray-400" />
            <span>
              {new Date(record.meetingDate).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: MeetingStatus | string, record: RealTimeMeeting) => (
        <Space direction="vertical" size="small">
          {/* Hiển thị real-time status */}
          {getStatusDisplay(record)}
          
          {/* Dropdown để manual update (chỉ cho admin) */}
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record.id, value)}
            size="small"
            style={{ width: 120 }}
            dropdownMatchSelectWidth={false}
          >
            <Option value="DRAFT">Nháp</Option>
            <Option value="SCHEDULED">Đã lên lịch</Option>
            <Option value="ONGOING">Đang diễn ra</Option>
            <Option value="COMPLETED">Đã hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: 'Thống kê',
      key: 'statistics',
      width: 120,
      render: (_: any, record: RealTimeMeeting) => (
        <div className="text-center">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-semibold text-blue-600">{record.totalShareholders}</div>
              <div className="text-xs text-gray-500">cổ đông</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">
                {(record.totalShares / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-gray-500">cổ phần</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
            <Tooltip title="Tài liệu">
              <FileTextOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => router.push(`/admin/meetings/${record.id}/documents`)}
              />
            </Tooltip>
            <Tooltip title="Chương trình nghị sự">
              <ClockCircleOutlined
                style={{ color: '#722ed1', cursor: 'pointer' }}
                onClick={() => router.push(`/admin/meetings/${record.id}/agendas`)}
              />
            </Tooltip>
           
           <Tooltip title="Nghị quyết">
            <FileTextOutlined
              style={{ color: '#722ed1', cursor: 'pointer' }}
              onClick={() => router.push(`/admin/meetings/${record.id}/resolutions`)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => {
                    setSelectedMeetingId(record.id)
                    setOpenDetail(true)
                }}
            />
          </Tooltip>
          <Tooltip title="Thống kê">
            <BarChartOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => {
                setSelectedMeeting(record)
                setOpenStatistics(true)
              }}
            />
          </Tooltip>
           <Tooltip title="Phiếu bầu">
              <AuditOutlined
                style={{ color: '#13c2c2', cursor: 'pointer' }}
                onClick={() => router.push(`/admin/meetings/${record.id}/votes`)}
              />
            </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedMeeting(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa cuộc họp',
                  content: `Bạn có chắc chắn muốn xóa cuộc họp "${record.meetingName}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteMeeting(record.id)
                      message.success('Xóa cuộc họp thành công')
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
    setStatusFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã, tên cuộc họp..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Select
            placeholder="Lọc trạng thái"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="DRAFT">Nháp</Option>
            <Option value="SCHEDULED">Đã lên lịch</Option>
            <Option value="ONGOING">Đang diễn ra</Option>
            <Option value="COMPLETED">Đã hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo cuộc họp
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={meetingsData}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} cuộc họp`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1200 }}
      />

      <MeetingCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <MeetingUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        meeting={selectedMeeting}
        refetch={refetch}
      />

      <MeetingStatisticsModal
        open={openStatistics}
        onClose={() => setOpenStatistics(false)}
        meeting={selectedMeeting}
      />

      <MeetingDetailModal
        open={openDetail}
        onClose={() => {
            setOpenDetail(false)
            setSelectedMeetingId(null)
        }}
        meetingId={selectedMeetingId}
        />
    </div>
  )
}
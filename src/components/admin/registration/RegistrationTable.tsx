// src/components/admin/registration/RegistrationTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useRegistrations } from '@/hooks/registration/useRegistrations'
import { useDeleteRegistration } from '@/hooks/registration/useDeleteRegistration'
import { useUpdateRegistrationStatus } from '@/hooks/registration/useRegistrationStatus'
import type { Registration, RegistrationType, RegistrationStatus } from '@/types/registration.type'
import { RegistrationCreateModal } from './RegistrationCreateModal'
import { RegistrationUpdateModal } from './RegistrationUpdateModal'
import { RegistrationDetailModal } from './RegistrationDetailModal'
import dayjs from 'dayjs'

const { Option } = Select

export default function RegistrationTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [shareholderIdFilter, setShareholderIdFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  const { data, isLoading, refetch } = useRegistrations({ 
    page, 
    limit: 10, 
    search, 
    status: statusFilter,
    meetingId: meetingIdFilter,
    shareholderId: shareholderIdFilter
  })
  

  const { mutateAsync: deleteRegistration } = useDeleteRegistration()
  const { mutateAsync: updateStatus } = useUpdateRegistrationStatus()

  const getStatusColor = (status: RegistrationStatus | string) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      APPROVED: 'blue',
      REJECTED: 'red',
      CANCELLED: 'gray'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: RegistrationStatus | string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      CANCELLED: 'Đã hủy'
    }
    return texts[status] || status
  }

  const getTypeColor = (type: RegistrationType | string) => {
    const colors: Record<string, string> = {
      IN_PERSON: 'purple',
      ONLINE: 'cyan',
      PROXY: 'gold',
      ABSENT: 'gray'
    }
    return colors[type] || 'default'
  }

  const getTypeText = (type: RegistrationType | string) => {
    const texts: Record<string, string> = {
      IN_PERSON: 'Trực tiếp',
      ONLINE: 'Trực tuyến',
      PROXY: 'Ủy quyền',
      ABSENT: 'Vắng mặt'
    }
    return texts[type] || type
  }

  const handleStatusChange = async (registrationId: number, newStatus: string) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn chuyển trạng thái thành "${getStatusText(newStatus)}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateStatus({ id: registrationId, status: newStatus })
          message.success('Cập nhật trạng thái thành công')
          refetch?.()
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Cập nhật thất bại')
        }
      },
    })
  }


  // Hàm kiểm tra xem đã tới thời điểm checkin chưa
  const isCheckinTimeReached = (checkinTime: string | null | undefined) => {
    if (!checkinTime) return true // Nếu không có checkinTime -> luôn cho phép điểm danh
    return dayjs().isAfter(dayjs(checkinTime))
    }

  const columns: ColumnsType<Registration> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã đăng ký',
      dataIndex: 'registrationCode',
      key: 'registrationCode',
      render: (code: string) => <strong>{code}</strong>,
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
      render: (shareholder: any) => shareholder?.fullName || '—',
    },
    {
      title: 'Số cổ phần',
      dataIndex: 'sharesRegistered',
      key: 'sharesRegistered',
      render: (shares: number) => shares.toLocaleString(),
    },
    {
      title: 'Hình thức',
      dataIndex: 'registrationType',
      key: 'registrationType',
      render: (type: RegistrationType | string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
   {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: RegistrationStatus | string, record: Registration) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          style={{ width: 130 }}
          size="small"
          dropdownStyle={{ minWidth: 150 }}
        >
          <Option value="PENDING">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined style={{ color: '#fa8c16' }} />
              <span>Chờ duyệt</span>
            </div>
          </Option>
          <Option value="APPROVED">
            <div className="flex items-center gap-2">
              <CheckCircleOutlined style={{ color: '#1890ff' }} />
              <span>Đã duyệt</span>
            </div>
          </Option>
          <Option value="REJECTED">
            <div className="flex items-center gap-2">
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Từ chối</span>
            </div>
          </Option>
          <Option value="CANCELLED">
            <div className="flex items-center gap-2">
              <StopOutlined style={{ color: '#8c8c8c' }} />
              <span>Đã hủy</span>
            </div>
          </Option>
        </Select>
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
                setSelectedRegistration(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedRegistration(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa đăng ký',
                  content: `Bạn có chắc chắn muốn xóa đăng ký "${record.registrationCode}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteRegistration(record.id)
                      message.success('Xóa đăng ký thành công')
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
    setMeetingIdFilter('')
    setShareholderIdFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã, tên cổ đông..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
          Thêm đăng ký
        </Button>
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
          showTotal: (total) => `Tổng ${total} đăng ký`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1300 }}
      />

      <RegistrationCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <RegistrationUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        registration={selectedRegistration}
        refetch={refetch}
      />

      <RegistrationDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        registration={selectedRegistration}
      />
    </div>
  )
}
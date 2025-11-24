// src/components/admin/proxy/ProxyTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Dropdown } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MoreOutlined, CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useProxies } from '@/hooks/proxy/useProxies'
import { useDeleteProxy } from '@/hooks/proxy/useDeleteProxy'
import { useApproveProxy } from '@/hooks/proxy/useApproveProxy'
import { useRejectProxy } from '@/hooks/proxy/useRejectProxy'
import { useRevokeProxy } from '@/hooks/proxy/useRevokeProxy'
import type { Proxy, ProxyStatus } from '@/types/proxy.type'
import { ProxyCreateModal } from './ProxyCreateModal'
import { ProxyUpdateModal } from './ProxyUpdateModal'
import { ProxyDetailModal } from './ProxyDetailModal'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'

const { Option } = Select

export default function ProxyTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [shareholderIdFilter, setShareholderIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null)

  const { data, isLoading, refetch } = useProxies({ 
    page, 
    limit: 10, 
    search, 
    meetingId: meetingIdFilter,
    shareholderId: shareholderIdFilter,
    status: statusFilter
  })
  
  const { mutateAsync: deleteProxy } = useDeleteProxy()
  const { mutateAsync: approveProxy } = useApproveProxy()
  const { mutateAsync: rejectProxy } = useRejectProxy()
  const { mutateAsync: revokeProxy } = useRevokeProxy()

  // Lấy danh sách meetings và shareholders cho filter
  const { data: meetingsData } = useAllMeetings()
  const { data: shareholdersData } = useAllShareholders()

  const getStatusColor = (status: ProxyStatus) => {
    const colors: Record<ProxyStatus, string> = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
      REVOKED: 'gray',
      EXPIRED: 'default'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: ProxyStatus) => {
    const texts: Record<ProxyStatus, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
      REVOKED: 'Đã thu hồi',
      EXPIRED: 'Đã hết hạn'
    }
    return texts[status] || status
  }

  const handleApprove = async (proxyId: number) => {
    try {
      await approveProxy({ id: proxyId, approvedBy: 1 }) // TODO: Get from auth context
      message.success('Duyệt ủy quyền thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Duyệt thất bại')
    }
  }

  const handleReject = async (proxyId: number) => {
    Modal.confirm({
      title: 'Từ chối ủy quyền',
      content: (
        <Input.TextArea 
          placeholder="Nhập lý do từ chối"
          rows={4}
          id="rejectReason"
        />
      ),
      onOk: async () => {
        const reason = (document.getElementById('rejectReason') as HTMLTextAreaElement)?.value
        try {
          await rejectProxy({ id: proxyId, rejectedReason: reason || 'Không có lý do' })
          message.success('Từ chối ủy quyền thành công')
          refetch?.()
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Từ chối thất bại')
        }
      }
    })
  }

  const handleRevoke = async (proxyId: number) => {
    try {
      await revokeProxy(proxyId)
      message.success('Thu hồi ủy quyền thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thu hồi thất bại')
    }
  }

  const getActionMenuItems = (record: Proxy) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => {
          setSelectedProxy(record)
          setOpenDetail(true)
        }
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Chỉnh sửa',
        onClick: () => {
          setSelectedProxy(record)
          setOpenUpdate(true)
        }
      }
    ]

    if (record.status === 'PENDING') {
      items.push(
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Duyệt',
          onClick: () => handleApprove(record.id)
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: 'Từ chối',
          onClick: () => handleReject(record.id)
        }
      )
    }

    if (record.status === 'APPROVED') {
      items.push({
        key: 'revoke',
        icon: <UndoOutlined />,
        label: 'Thu hồi',
        onClick: () => handleRevoke(record.id)
      })
    }

    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      onClick: () => {
        Modal.confirm({
          title: 'Xác nhận xóa ủy quyền',
          content: `Bạn có chắc chắn muốn xóa ủy quyền này không?`,
          okText: 'Xóa',
          okType: 'danger',
          cancelText: 'Hủy',
          onOk: async () => {
            try {
              await deleteProxy(record.id)
              message.success('Xóa ủy quyền thành công')
              refetch?.()
            } catch (error: any) {
              message.error(error?.response?.data?.message || 'Xóa thất bại')
            }
          },
        })
      }
    })

    return items
  }

  const columns: ColumnsType<Proxy> = [
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
      render: (meeting: any) => (
        <div className="flex flex-col">
          <strong className="text-blue-600">{meeting?.meetingCode}</strong>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {meeting?.meetingName}
          </span>
        </div>
      ),
    },
    {
      title: 'Cổ đông ủy quyền',
      dataIndex: 'shareholder',
      key: 'shareholder',
      render: (shareholder: any) => (
        <div className="flex flex-col">
          <strong>{shareholder?.fullName}</strong>
          <span className="text-xs text-gray-500">{shareholder?.shareholderCode}</span>
        </div>
      ),
    },
    {
      title: 'Người nhận ủy quyền',
      dataIndex: 'proxyPerson',
      key: 'proxyPerson',
      render: (proxyPerson: any) => (
        <div className="flex flex-col">
          <strong>{proxyPerson?.fullName}</strong>
          <span className="text-xs text-gray-500">{proxyPerson?.shareholderCode}</span>
        </div>
      ),
    },
    {
      title: 'Số cổ phần',
      dataIndex: 'shares',
      key: 'shares',
      render: (shares: number) => (
        <div className="text-right">
          <div className="font-semibold">{shares.toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: 'Thời hạn',
      key: 'duration',
      render: (_: any, record: Proxy) => (
        <div className="flex flex-col text-xs">
          <span>Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}</span>
          <span>Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProxyStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
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
    setStatusFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã, tên..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[250px]"
          />
          <Select
            placeholder="Cuộc họp"
            value={meetingIdFilter || undefined}
            onChange={setMeetingIdFilter}
            allowClear
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const label = String(option?.label ?? '').toLowerCase()
              return label.includes(input.toLowerCase())
            }}
          >
            {meetingsData?.map((meeting: any) => (
              <Option 
                key={meeting.id} 
                value={meeting.id.toString()}
                label={`${meeting.meetingCode} - ${meeting.meetingName}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{meeting.meetingCode}</span>
                  <span className="text-xs text-gray-500 truncate">
                    {meeting.meetingName}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Cổ đông"
            value={shareholderIdFilter || undefined}
            onChange={setShareholderIdFilter}
            allowClear
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const label = String(option?.label ?? '').toLowerCase()
              return label.includes(input.toLowerCase())
            }}
          >
            {shareholdersData?.map((shareholder: any) => (
              <Option 
                key={shareholder.id} 
                value={shareholder.id.toString()}
                label={`${shareholder.shareholderCode} - ${shareholder.fullName}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{shareholder.shareholderCode}</span>
                  <span className="text-xs text-gray-500 truncate">
                    {shareholder.fullName}
                  </span>
                </div>
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
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Đã từ chối</Option>
            <Option value="REVOKED">Đã thu hồi</Option>
            <Option value="EXPIRED">Đã hết hạn</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
          Tạo ủy quyền
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
          showTotal: (total) => `Tổng ${total} ủy quyền`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1200 }}
      />

      <ProxyCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ProxyUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        proxy={selectedProxy}
        refetch={refetch}
      />

      <ProxyDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        proxy={selectedProxy}
      />
    </div>
  )
}
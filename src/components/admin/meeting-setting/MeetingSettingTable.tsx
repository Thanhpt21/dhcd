// src/components/admin/meeting-setting/MeetingSettingTable.tsx (Updated)
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useMeetingSettings } from '@/hooks/meeting-setting/useMeetingSettings'
import { useDeleteMeetingSetting } from '@/hooks/meeting-setting/useDeleteMeetingSetting'
import { useToggleMeetingSettingActive } from '@/hooks/meeting-setting/useToggleMeetingSettingActive'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings' // Có thể bỏ nếu không dùng cho filter
import type { MeetingSetting, DataType } from '@/types/meeting-setting.type'
import { MeetingSettingCreateModal } from './MeetingSettingCreateModal'
import { MeetingSettingUpdateModal } from './MeetingSettingUpdateModal'
import { MeetingSettingDetailModal } from './MeetingSettingDetailModal'

const { Option } = Select

export default function MeetingSettingTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<MeetingSetting | null>(null)

  const { data, isLoading, refetch } = useMeetingSettings({ 
    page, 
    limit: 10, 
    search, 
    meetingId: meetingIdFilter,
    isActive: isActiveFilter
  })
  
  const { mutateAsync: deleteMeetingSetting } = useDeleteMeetingSetting()
  const { mutateAsync: toggleActive } = useToggleMeetingSettingActive()

  // Chỉ dùng cho filter dropdown (nếu cần)
  const { data: meetingsData } = useAllMeetings()

  const getDataTypeColor = (dataType: DataType) => {
    const colors: Record<DataType, string> = {
      STRING: 'blue',
      NUMBER: 'green',
      BOOLEAN: 'orange',
      JSON: 'purple',
      DATE: 'cyan'
    }
    return colors[dataType] || 'default'
  }

  const getDataTypeText = (dataType: DataType) => {
    const texts: Record<DataType, string> = {
      STRING: 'Chuỗi',
      NUMBER: 'Số',
      BOOLEAN: 'Boolean',
      JSON: 'JSON',
      DATE: 'Ngày'
    }
    return texts[dataType] || dataType
  }

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await toggleActive(id)
      message.success(`${currentActive ? 'Tắt' : 'Bật'} cài đặt thành công`)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const columns: ColumnsType<MeetingSetting> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Cuộc họp',
      dataIndex: 'meetingId',
      key: 'meetingId',
      render: (meetingId: number, record: MeetingSetting) => {
        // Sử dụng meeting object từ API response
        const meeting = record.meeting
        return (
          <div className="flex flex-col">
            <strong className="text-blue-600">{meeting?.meetingCode}</strong>
            <span className="text-xs text-gray-500 truncate max-w-[200px]">
              {meeting?.meetingName}
            </span>
          </div>
        )
      },
    },
    {
      title: 'Khóa',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (value: string, record: MeetingSetting) => (
        <Tooltip title={value}>
          <span>{record.dataType === 'BOOLEAN' ? (value === 'true' ? 'Có' : 'Không') : value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (dataType: DataType) => (
        <Tag color={getDataTypeColor(dataType)}>
          {getDataTypeText(dataType)}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '—',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: MeetingSetting) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id, isActive)}
          size="small"
        />
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
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedSetting(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedSetting(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa cài đặt',
                  content: `Bạn có chắc chắn muốn xóa cài đặt "${record.key}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteMeetingSetting(record.id)
                      message.success('Xóa cài đặt thành công')
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
    setIsActiveFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo khóa, giá trị..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[250px]"
          />
          <Select
            placeholder="Lọc theo cuộc họp"
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
            placeholder="Trạng thái"
            value={isActiveFilter || undefined}
            onChange={setIsActiveFilter}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="true">Đang hoạt động</Option>
            <Option value="false">Đã tắt</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
          Thêm cài đặt
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
          showTotal: (total) => `Tổng ${total} cài đặt`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1000 }}
      />

      <MeetingSettingCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <MeetingSettingUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        setting={selectedSetting}
        refetch={refetch}
      />

      <MeetingSettingDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        setting={selectedSetting}
      />
    </div>
  )
}
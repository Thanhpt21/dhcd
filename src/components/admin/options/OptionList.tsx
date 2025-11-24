// src/components/admin/option/OptionList.tsx
'use client'

import { Table, Tag, Space, Tooltip, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useUpdateOption } from '@/hooks/option/useUpdateOption'
import { useDeleteOption } from '@/hooks/option/useDeleteOption'
import { ResolutionOption } from '@/types/option.type'


interface OptionListProps {
  options: ResolutionOption[]
  loading?: boolean
  onEdit: (option: ResolutionOption) => void
  onRefresh: () => void
}

export default function OptionList({ 
  options, 
  loading, 
  onEdit, 
  onRefresh 
}: OptionListProps) {
  const { mutateAsync: updateOption } = useUpdateOption()
  const { mutateAsync: deleteOption } = useDeleteOption()

  const getOptionTypeIcon = (optionValue: string) => {
    if (optionValue === 'YES') {
      return <CheckOutlined style={{ color: '#52c41a' }} />
    } else if (optionValue === 'NO') {
      return <CloseOutlined style={{ color: '#ff4d4f' }} />
    }
    return null
  }

  const getOptionTypeColor = (optionValue: string) => {
    if (optionValue === 'YES') return 'green'
    if (optionValue === 'NO') return 'red'
    return 'blue'
  }

  const handleDelete = async (option: ResolutionOption) => {
    try {
      await deleteOption(option.id)
      message.success('Xóa phương án thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<ResolutionOption> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã phương án',
      dataIndex: 'optionCode',
      key: 'optionCode',
      render: (code: string, record) => (
        <Space>
          {getOptionTypeIcon(record.optionValue)}
          <strong>{code}</strong>
        </Space>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'optionValue',
      key: 'optionValue',
      render: (value: string) => (
        <Tag color={getOptionTypeColor(value)}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'optionText',
      key: 'optionText',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span className="text-gray-600">{desc || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Số phiếu',
      dataIndex: 'voteCount',
      key: 'voteCount',
      width: 100,
      render: (votes: number) => (
        <div className="text-center">
          <div className="font-semibold">{votes.toLocaleString()}</div>
          <div className="text-xs text-gray-500">phiếu</div>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={
              <div>
                <div>Xác nhận xóa</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  Bạn có chắc chắn muốn xóa phương án này?
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ color: 'red', cursor: 'pointer' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={options}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 800 }}
    />
  )
}
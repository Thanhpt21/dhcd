'use client'

import {
  Table,
  Tag,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useState } from 'react'

import { PromptAI } from '@/types/promptAI.type'
import { usePromptAIs } from '@/hooks/promptAI/usePromptAIs'
import { useDeletePromptAI } from '@/hooks/promptAI/useDeletePromptAI'
import { PromptAICreateModal } from './PromptAICreateModal'
import { PromptAIUpdateModal } from './PromptAIUpdateModal'

export default function PromptAITable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedPromptAI, setSelectedPromptAI] = useState<PromptAI | null>(null)


  const { data, isLoading, refetch } = usePromptAIs({ page, limit: 10, search })
  const { mutateAsync: deletePromptAI, isPending: isDeleting } = useDeletePromptAI()
  const columns: ColumnsType<PromptAI> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên Prompt AI',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      align: 'center' as const,
      width: 80,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'ACTIVE'
              ? 'success'
              : status === 'INACTIVE'
              ? 'warning'
              : 'error'
          }
        >
          {status === 'ACTIVE'
            ? 'Hoạt động'
            : status === 'INACTIVE'
            ? 'Tạm dừng'
            : 'Đã xóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
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
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedPromptAI(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa Prompt AI',
                  content: `Bạn có chắc chắn muốn xóa "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deletePromptAI(record.id)
                      message.success('Xóa thành công')
                      refetch()
                    } catch (error: any) {
                      message.error(
                        error?.response?.data?.message || 'Xóa thất bại'
                      )
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên Prompt AI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(data?.data) ? data?.data : []}
        rowKey="id"
        loading={isLoading || isDeleting}
        pagination={{
          total: data?.total ?? 0,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} Prompt AI`,
        }}
      />

      <PromptAICreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <PromptAIUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        promptAI={selectedPromptAI}
        refetch={refetch}
      />
    </div>
  )
}
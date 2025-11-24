// src/components/admin/email/EmailTemplatesTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Switch, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, CopyOutlined, MailOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates'
import { useDeleteEmailTemplate } from '@/hooks/email/useDeleteEmailTemplate'
import { useToggleEmailTemplateActive } from '@/hooks/email/useToggleEmailTemplateActive'
import { useDuplicateEmailTemplate } from '@/hooks/email/useDuplicateEmailTemplate'
import { useTemplateCategories } from '@/hooks/email/useTemplateCategories'
import type { EmailTemplate } from '@/types/email.type'
import { EmailTemplateCreateModal } from './EmailTemplateCreateModal'
import { EmailTemplateUpdateModal } from './EmailTemplateUpdateModal'
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal'
import dayjs from 'dayjs'
import { EmailTemplateDetailModal } from './EmailTemplateDetailModal'

const { Option } = Select

export default function EmailTemplatesTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

  const { data, isLoading, refetch } = useEmailTemplates(
    page, 
    10, 
    categoryFilter, 
    isActiveFilter, 
    languageFilter, 
    search
  )

  const { data: categories } = useTemplateCategories()
  
  const { mutateAsync: deleteEmailTemplate } = useDeleteEmailTemplate()
  const { mutateAsync: toggleActive } = useToggleEmailTemplateActive()
  const { mutateAsync: duplicateTemplate } = useDuplicateEmailTemplate()

 const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        REGISTRATION: 'blue',
        ATTENDANCE: 'magenta',
    }
    return colors[category] || 'default'
}


  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await toggleActive(id)
      message.success(`Template đã được ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'}`)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateTemplate(id)
      message.success('Nhân bản template thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Nhân bản thất bại')
    }
  }

  const columns: ColumnsType<EmailTemplate> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên template',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject: string) => subject || '—',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => (
        <Tag>{language.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: EmailTemplate) => (
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
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTemplate(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>

          <Tooltip title="Preview">
            <MailOutlined
              style={{ color: '#722ed1', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTemplate(record)
                setOpenPreview(true)
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTemplate(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>

          <Tooltip title="Nhân bản">
            <CopyOutlined
              style={{ color: '#13c2c2', cursor: 'pointer' }}
              onClick={() => handleDuplicate(record.id)}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa template',
                  content: `Bạn có chắc chắn muốn xóa template "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteEmailTemplate(record.id)
                      message.success('Xóa template thành công')
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
    setCategoryFilter('')
    setIsActiveFilter('')
    setLanguageFilter('')
    setPage(1)
  }

  return (
    <div>
      {/* Search & Filters */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm theo tên, tiêu đề..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              className="w-[300px]"
            />
            <Select
              placeholder="Danh mục"
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: 150 }}
            >
              {categories?.map((cat: any) => (
                <Option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Trạng thái"
              value={isActiveFilter || undefined}
              onChange={setIsActiveFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="true">Hoạt động</Option>
              <Option value="false">Vô hiệu hóa</Option>
            </Select>
            <Select
              placeholder="Ngôn ngữ"
              value={languageFilter || undefined}
              onChange={setLanguageFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button onClick={handleReset}>
              Đặt lại
            </Button>
          </div>

          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setOpenCreate(true)}
          >
            Tạo Template
          </Button>
        </div>
      </Card>

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
          showTotal: (total) => `Tổng ${total} template`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1000 }}
      />

      <EmailTemplateCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <EmailTemplateUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        template={selectedTemplate}
        refetch={refetch}
      />

      <EmailTemplateDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        template={selectedTemplate}
      />

      <EmailTemplatePreviewModal
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        template={selectedTemplate}
      />
    </div>
  )
}
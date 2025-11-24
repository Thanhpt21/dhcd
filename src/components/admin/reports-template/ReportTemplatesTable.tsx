'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Switch, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { ReportTemplate } from '@/types/report.type'
import { ReportTemplateCreateModal } from './ReportTemplateCreateModal'
import { ReportTemplateUpdateModal } from './ReportTemplateUpdateModal'
import { ReportTemplateDetailModal } from './ReportTemplateDetailModal'
import dayjs from 'dayjs'
import { useReportTemplates } from '@/hooks/report/useReportTemplates'
import { useAllReportTemplates } from '@/hooks/report/useAllReportTemplates'
import { useDeleteReportTemplate } from '@/hooks/report/useDeleteReportTemplate'
import { useUpdateReportTemplate } from '@/hooks/report/useUpdateReportTemplate'
import { useCreateReportTemplate } from '@/hooks/report/useCreateReportTemplate'

const { Option } = Select

export default function ReportTemplatesTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [formatFilter, setFormatFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  const { data, isLoading, refetch } = useReportTemplates({
    page, 
    limit: 10,
    type: typeFilter,
    search
  })

  const { data: allTemplates } = useAllReportTemplates()
  
  const { mutateAsync: deleteReportTemplate } = useDeleteReportTemplate()
  const { mutateAsync: updateReportTemplate } = useUpdateReportTemplate()
  const { mutateAsync: createReportTemplate } = useCreateReportTemplate()

  // Map các loại báo cáo sang tiếng Việt
  const reportTypeLabels: Record<string, string> = {
    'ATTENDANCE_REPORT': 'Báo Cáo Điểm Danh',
    'VOTING_RESULTS': 'Kết Quả Bỏ Phiếu',
    'REGISTRATION_STATS': 'Thống Kê Đăng Ký',
    'QUESTION_ANALYTICS': 'Phân Tích Câu Hỏi',
    'SHAREHOLDER_ANALYSIS': 'Báo Cáo Cổ Đông'
  }

    const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ATTENDANCE_REPORT': 'green',
      'VOTING_RESULTS': 'orange',
      'REGISTRATION_STATS': 'purple',
      'QUESTION_ANALYTICS': 'cyan',
      'SHAREHOLDER_ANALYSIS': 'magenta'
    }
    return colors[type] || 'default'
  }

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'PDF': 'red',
      'EXCEL': 'green',
      'CSV': 'blue',
      'HTML': 'orange'
    }
    return colors[format] || 'default'
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await updateReportTemplate({
        id,
        data: { isActive: !currentStatus }
      })
      message.success(`Mẫu báo cáo đã được ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'}`)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleDuplicate = async (template: ReportTemplate) => {
    try {
      await createReportTemplate({
        templateName: `${template.templateName} (Bản sao)`,
        templateType: template.templateType,
        templateFile: template.templateFile,
        outputFormat: template.outputFormat,
        isActive: false
      })
      message.success('Nhân bản mẫu báo cáo thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Nhân bản thất bại')
    }
  }

  const columns: ColumnsType<ReportTemplate> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên mẫu báo cáo',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Loại báo cáo',
      dataIndex: 'templateType',
      key: 'templateType',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {reportTypeLabels[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Định dạng',
      dataIndex: 'outputFormat',
      key: 'outputFormat',
      render: (format: string) => (
        <Tag color={getFormatColor(format)}>
          {format}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: ReportTemplate) => (
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
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
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
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa mẫu báo cáo',
                  content: `Bạn có chắc chắn muốn xóa mẫu báo cáo "${record.templateName}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteReportTemplate(record.id)
                      message.success('Xóa mẫu báo cáo thành công')
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
    setTypeFilter('')
    setIsActiveFilter('')
    setFormatFilter('')
    setPage(1)
  }

  // Get unique types for filter với label tiếng Việt
  const uniqueTypes = Array.from(new Set(allTemplates?.map(t => t.templateType) || []))

  return (
    <div>
      {/* Tìm kiếm & Bộ lọc */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm theo tên mẫu báo cáo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              className="w-[300px]"
            />
            <Select
              placeholder="Loại báo cáo"
              value={typeFilter || undefined}
              onChange={setTypeFilter}
              allowClear
              style={{ width: 200 }}
            >
              {uniqueTypes.map(type => (
                <Option key={type} value={type}>
                  {reportTypeLabels[type] || type}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Định dạng"
              value={formatFilter || undefined}
              onChange={setFormatFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="PDF">PDF</Option>
              <Option value="EXCEL">Excel</Option>
              <Option value="CSV">CSV</Option>
              <Option value="HTML">HTML</Option>
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
            Tạo Mẫu Báo Cáo
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
          showTotal: (total) => `Tổng ${total} mẫu báo cáo`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1000 }}
      />

      <ReportTemplateCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ReportTemplateUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        template={selectedTemplate}
        refetch={refetch}
      />

      <ReportTemplateDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        template={selectedTemplate}
      />
    </div>
  )
}
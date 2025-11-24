// src/components/admin/shareholder/ShareholderTable.tsx (Updated)
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Switch, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, HistoryOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useShareholders } from '@/hooks/shareholder/useShareholders'
import { useDeleteShareholder } from '@/hooks/shareholder/useDeleteShareholder'
import { useUpdateShareholderStatus } from '@/hooks/shareholder/useUpdateShareholderStatus'
import { useImportShareholders } from '@/hooks/shareholder/useImportShareholders'
import { useExportShareholders } from '@/hooks/shareholder/useExportShareholders'
import type { Shareholder, Gender, ShareType } from '@/types/shareholder.type'
import { ShareholderCreateModal } from './ShareholderCreateModal'
import { ShareholderUpdateModal } from './ShareholderUpdateModal'
import { ShareholderDetailModal } from './ShareholderDetailModal'
import { ShareholderHistoryModal } from './ShareholderHistoryModal'

const { Option } = Select

export default function ShareholderTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openHistory, setOpenHistory] = useState(false)
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null)

  const { data, isLoading, refetch } = useShareholders({ 
    page, 
    limit: 10, 
    search, 
    isActive: isActiveFilter 
  })
  
  const { mutateAsync: deleteShareholder } = useDeleteShareholder()
  const { mutateAsync: updateStatus } = useUpdateShareholderStatus()
  const { mutateAsync: importShareholders, isPending: isImporting } = useImportShareholders()
  const { mutateAsync: exportShareholders, isPending: isExporting } = useExportShareholders()

  const getGenderColor = (gender?: Gender | string) => {
    const colors: Record<string, string> = {
      MALE: 'blue',
      FEMALE: 'pink',
      OTHER: 'orange'
    }
    return colors[gender || ''] || 'default'
  }

  const getGenderText = (gender?: Gender | string) => {
    const texts: Record<string, string> = {
      MALE: 'Nam',
      FEMALE: 'Nữ',
      OTHER: 'Khác'
    }
    return texts[gender || ''] || gender
  }

  const getShareTypeColor = (shareType: ShareType | string) => {
    const colors: Record<string, string> = {
      COMMON: 'green',
      PREFERRED: 'purple'
    }
    return colors[shareType] || 'default'
  }

  const getShareTypeText = (shareType: ShareType | string) => {
    const texts: Record<string, string> = {
      COMMON: 'Cổ phần phổ thông',
      PREFERRED: 'Cổ phần ưu đãi'
    }
    return texts[shareType] || shareType
  }

  const handleStatusChange = async (shareholderId: number, currentActive: boolean) => {
    try {
      await updateStatus({ id: shareholderId, isActive: !currentActive })
      message.success(`${currentActive ? 'Tắt' : 'Bật'} cổ đông thành công`)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const handleImport = async (file: File) => {
    try {
      await importShareholders(file)
      message.success('Nhập dữ liệu cổ đông thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Nhập dữ liệu thất bại')
    }
    return false // Prevent default upload
  }

  const handleExport = async () => {
    try {
      const result = await exportShareholders()
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh-sach-co-dong.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Xuất dữ liệu cổ đông thành công')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xuất dữ liệu thất bại')
    }
  }

  const columns: ColumnsType<Shareholder> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã cổ đông',
      dataIndex: 'shareholderCode',
      key: 'shareholderCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      ellipsis: true,
    },
    {
      title: 'CMND/CCCD',
      dataIndex: 'idNumber',
      key: 'idNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Số cổ phần',
      dataIndex: 'totalShares',
      key: 'totalShares',
      render: (shares: number) => (
        <div className="text-right">
          <div className="font-semibold">{shares.toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: 'Loại cổ phần',
      dataIndex: 'shareType',
      key: 'shareType',
      render: (shareType: ShareType | string) => (
        <Tag color={getShareTypeColor(shareType)}>
          {getShareTypeText(shareType)}
        </Tag>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender?: Gender | string) => 
        gender ? <Tag color={getGenderColor(gender)}>{getGenderText(gender)}</Tag> : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Shareholder) => (
        <Switch
          checked={isActive}
          onChange={() => handleStatusChange(record.id, isActive)}
          size="small"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Lịch sử cổ phần">
            <HistoryOutlined
              style={{ color: '#722ed1', cursor: 'pointer' }}
              onClick={() => {
                setSelectedShareholder(record)
                setOpenHistory(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedShareholder(record)
                setOpenDetail(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedShareholder(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa cổ đông',
                  content: `Bạn có chắc chắn muốn xóa cổ đông "${record.fullName}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteShareholder(record.id)
                      message.success('Xóa cổ đông thành công')
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
    setIsActiveFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã, tên, email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Select
            placeholder="Trạng thái"
            value={isActiveFilter || undefined}
            onChange={setIsActiveFilter}
            allowClear
            style={{ width: 150 }}
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

        <div className="flex items-center gap-2">
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />} loading={isImporting}>
              Nhập Excel
            </Button>
          </Upload>
          
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={isExporting}
          >
            Xuất Excel
          </Button>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
            Thêm cổ đông
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
          showTotal: (total) => `Tổng ${total} cổ đông`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1200 }}
      />

      <ShareholderCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ShareholderUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        shareholder={selectedShareholder}
        refetch={refetch}
      />

      <ShareholderDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        shareholder={selectedShareholder}
      />

      <ShareholderHistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        shareholder={selectedShareholder}
      />
    </div>
  )
}
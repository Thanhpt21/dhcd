// src/components/admin/document/DocumentList.tsx
'use client'

import { Table, Tag, Space, Tooltip, Button, Switch, message, Dropdown } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, MoreOutlined, FileTextOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined, FileImageOutlined } from '@ant-design/icons'
import { useUpdateDocument } from '@/hooks/document/useUpdateDocument'
import { useDeleteDocument } from '@/hooks/document/useDeleteDocument'
import { Document, DocumentCategory } from '@/types/document.type'

interface DocumentListProps {
  documents: Document[]
  loading?: boolean
  onEdit: (document: Document) => void
  onRefresh: () => void
}

export default function DocumentList({ 
  documents, 
  loading, 
  onEdit, 
  onRefresh 
}: DocumentListProps) {
  const { mutateAsync: updateDocument } = useUpdateDocument()
  const { mutateAsync: deleteDocument } = useDeleteDocument()

  const getCategoryColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      [DocumentCategory.FINANCIAL_REPORT]: 'green',
      [DocumentCategory.RESOLUTION]: 'blue',
      [DocumentCategory.MINUTES]: 'orange',
      [DocumentCategory.PRESENTATION]: 'purple',
      [DocumentCategory.GUIDE]: 'cyan',
      [DocumentCategory.OTHER]: 'default'
    }
    return colors[category] || 'default'
  }

  const getCategoryText = (category: DocumentCategory) => {
    const texts: Record<DocumentCategory, string> = {
      [DocumentCategory.FINANCIAL_REPORT]: 'Báo cáo Tài chính',
      [DocumentCategory.RESOLUTION]: 'Nghị quyết',
      [DocumentCategory.MINUTES]: 'Biên bản',
      [DocumentCategory.PRESENTATION]: 'Trình chiếu',
      [DocumentCategory.GUIDE]: 'Hướng dẫn',
      [DocumentCategory.OTHER]: 'Khác'
    }
    return texts[category]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
    if (fileType.includes('word') || fileType.includes('document')) return <FileWordOutlined style={{ color: '#1890ff' }} />
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileExcelOutlined style={{ color: '#52c41a' }} />
    if (fileType.includes('image')) return <FileImageOutlined style={{ color: '#faad14' }} />
    return <FileTextOutlined style={{ color: '#722ed1' }} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (fileType: string): string => {
    const extensions: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'text/plain': 'txt'
    }
    return extensions[fileType] || 'file'
  }

  const handleVisibilityToggle = async (document: Document) => {
    try {
      const formData = new FormData()
      formData.append('isPublic', (!document.isPublic).toString())
      
      // Giữ nguyên các field khác với đúng kiểu dữ liệu
      formData.append('documentCode', document.documentCode)
      formData.append('title', document.title)
      formData.append('category', document.category)
      formData.append('displayOrder', document.displayOrder.toString())
      if (document.description) {
        formData.append('description', document.description)
      }
      formData.append('fileType', document.fileType)
      formData.append('fileSize', document.fileSize.toString())
      formData.append('uploadedBy', document.uploadedBy.toString())
      formData.append('meetingId', document.meetingId.toString())

      await updateDocument({
        id: document.id,
        formData
      })
      message.success(`Đã ${!document.isPublic ? 'công khai' : 'ẩn'} tài liệu`)
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }



  const handleDelete = async (document: Document) => {
    try {
      await deleteDocument(document.id)
      message.success('Xóa tài liệu thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<Document> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã tài liệu',
      dataIndex: 'documentCode',
      key: 'documentCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record) => (
        <Space direction="vertical" size="small">
          <div className="font-semibold flex items-center gap-2">
            {getFileIcon(record.fileType)}
            {title}
          </div>
          {record.description && (
            <div className="text-xs text-gray-500">
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description
              }
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Loại tài liệu',
      dataIndex: 'category',
      key: 'category',
      render: (category: DocumentCategory) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryText(category)}
        </Tag>
      ),
    },
    {
      title: 'Loại file',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (fileType: string) => (
        <Tag>
          {fileType.split('/')[1]?.toUpperCase() || fileType}
        </Tag>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (fileSize: number) => formatFileSize(fileSize),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 120,
      render: (isPublic: boolean, record: Document) => (
        <Switch
          checked={isPublic}
          checkedChildren="Công khai"
          unCheckedChildren="Riêng tư"
          onChange={() => handleVisibilityToggle(record)}
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
          <Tooltip title="Xem trước">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => window.open(record.fileUrl, '_blank')}
            />
          </Tooltip>
          
        

          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Chỉnh sửa',
                  icon: <EditOutlined />,
                  onClick: () => onEdit(record)
                },
                {
                  key: 'delete',
                  label: 'Xóa',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={documents}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 1300 }}
    />
  )
}
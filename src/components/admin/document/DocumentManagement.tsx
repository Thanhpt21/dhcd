// src/components/admin/document/DocumentManagement.tsx
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic } from 'antd'
import { PlusOutlined, FileTextOutlined, CloudUploadOutlined } from '@ant-design/icons'
import { useMeetingDocuments } from '@/hooks/document/useMeetingDocuments'
import { useDocumentStatistics } from '@/hooks/document/useDocumentStatistics'
import DocumentList from './DocumentList'
import DocumentForm from './DocumentForm'
import type { Document } from '@/types/document.type'

interface DocumentManagementProps {
  meetingId: number
  meetingCode: string
  meetingName: string
}

export default function DocumentManagement({ 
  meetingId, 
  meetingCode, 
  meetingName 
}: DocumentManagementProps) {
  const [openForm, setOpenForm] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const { data: documents, isLoading, refetch } = useMeetingDocuments(meetingId)
  const { data: statistics } = useDocumentStatistics(meetingId)

  const handleFormSuccess = () => {
    setOpenForm(false)
    setSelectedDocument(null)
    refetch?.()
    message.success(selectedDocument ? 'Cập nhật tài liệu thành công' : 'Tạo tài liệu thành công')
  }

  const handleCreate = () => {
    setSelectedDocument(null)
    setOpenForm(true)
  }

  const handleEdit = (document: Document) => {
    setSelectedDocument(document)
    setOpenForm(true)
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <FileTextOutlined />
          <span>Danh sách Tài liệu</span>
        </Space>
      ),
      children: (
        <DocumentList
          documents={documents || []}
          loading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: 'public',
      label: (
        <Space>
          <CloudUploadOutlined />
          <span>Tài liệu Công khai</span>
        </Space>
      ),
      children: (
        <DocumentList
          documents={(documents || []).filter((doc: any) => doc.isPublic)}
          loading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {meetingName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600">Mã cuộc họp:</span>
              <span className="font-semibold">{meetingCode}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tổng tài liệu</div>
            <div className="text-2xl font-bold text-blue-600">
              {documents?.length || 0}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Quản lý Tài liệu Cuộc họp"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm Tài liệu
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Form Modal (Create & Update) */}
      <DocumentForm
        open={openForm}
        onClose={() => {
          setOpenForm(false)
          setSelectedDocument(null)
        }}
        onSuccess={handleFormSuccess}
        meetingId={meetingId}
        document={selectedDocument}
        isEdit={!!selectedDocument}
      />
    </div>
  )
}
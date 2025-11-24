'use client'

import { List, Button, Tag, Space, Spin, Empty, Typography, Grid } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { useMeetingDocuments } from '@/hooks/document/useMeetingDocuments'

const { Text } = Typography
const { useBreakpoint } = Grid

interface DocumentsTabProps {
  meetingId: number
}

export default function DocumentsTab({ meetingId }: DocumentsTabProps) {
  const screens = useBreakpoint()
  const { 
    data: documents, 
    isLoading: documentsLoading 
  } = useMeetingDocuments(meetingId)

  if (documentsLoading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return <Empty description="Chưa có tài liệu nào" />
  }

  return (
    <List
      itemLayout={screens.xs ? "vertical" : "horizontal"}
      dataSource={documents}
      renderItem={(document: any) => (
        <List.Item
          actions={[
            <Button 
              key="download" 
              type="link" 
              href={document.fileUrl}
              target="_blank"
              size={screens.xs ? "small" : "middle"}
            >
              Tải xuống
            </Button>
          ]}
        >
          <List.Item.Meta
            avatar={<FileTextOutlined className="text-blue-500 text-lg md:text-xl" />}
            title={
              <Space direction={screens.xs ? "vertical" : "horizontal"} align={screens.xs ? "start" : "center"} size="small">
                <Text strong className={screens.xs ? 'text-base' : 'text-lg'}>{document.title}</Text>
                {document.isPublic && <Tag color="green" className="text-xs">Công khai</Tag>}
              </Space>
            }
            description={
              <Space direction="vertical" size="small" className="w-full">
                <Text type="secondary" className="text-sm">{document.description}</Text>
                <Text type="secondary" className="text-xs">
                  Loại: {document.fileType} • Kích thước: {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )
}
// src/app/admin/meetings/[id]/resolutions/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import ResolutionManagement from '@/components/admin/resolution/ResolutionManagement'

const { Title } = Typography

export default function ResolutionPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = parseInt(params.id as string)

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/admin/meetings')}
        >
          Quay lại
        </Button>
        <Title level={4} className="!mb-0">Quản lý Nghị quyết</Title>
      </div>
      
      <ResolutionManagement meetingId={meetingId} />
    </div>
  )
}
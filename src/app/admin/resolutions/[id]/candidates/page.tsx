// src/app/admin/resolutions/[id]/candidates/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useResolutionDetail } from '@/hooks/resolution/useResolutionDetail'
import CandidateManagement from '@/components/admin/candidate/CandidateManagement'

const { Title } = Typography

export default function CandidatePage() {
  const params = useParams()
  const router = useRouter()
  const resolutionId = parseInt(params.id as string)

  const { data: resolution, isLoading } = useResolutionDetail(resolutionId)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!resolution) {
    return <div>Không tìm thấy nghị quyết</div>
  }

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
        <Title level={4} className="!mb-0">Quản lý Ứng cử viên</Title>
      </div>
      
      <CandidateManagement
        resolutionId={resolutionId}
        resolutionCode={resolution.resolutionCode}
        resolutionTitle={resolution.title}
      />
    </div>
  )
}
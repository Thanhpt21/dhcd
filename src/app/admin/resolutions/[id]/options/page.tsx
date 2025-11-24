// src/app/admin/resolutions/[id]/options/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Card, Spin, Alert, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useResolutionDetail } from '@/hooks/resolution/useResolutionDetail'
import OptionManagement from '@/components/admin/options/OptionManagement'


export default function ResolutionOptionsPage() {
  const params = useParams()
  const router = useRouter()
  const resolutionId = Number(params.id)

  const { data: resolution, isLoading, error } = useResolutionDetail(resolutionId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (error || !resolution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="Không tìm thấy nghị quyết"
          description="Nghị quyết không tồn tại hoặc đã bị xóa"
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={() => router.push('/admin/resolutions')}
            >
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    )
  }

  return (

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/admin/meetings')}
            className="mb-4"
          >
            Quay lại
          </Button>
        
        </div>

        {/* Option Management Component */}
        <OptionManagement
          resolutionId={resolutionId}
          resolutionCode={resolution.resolutionCode}
          resolutionTitle={resolution.title}
          votingMethod={resolution.votingMethod}
        />
      </div>

  )
}
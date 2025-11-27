// src/app/admin/resolutions/[id]/options/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Card, Spin, Alert, Button } from 'antd'
import { useRouter } from 'next/navigation'
import { useResolutionDetail } from '@/hooks/resolution/useResolutionDetail'
import OptionManagement from '@/components/admin/options/OptionManagement'
import dynamic from 'next/dynamic'

// Dynamic import icon để tránh lỗi RSC
const ArrowLeftOutlined = dynamic(
  () => import('@ant-design/icons').then(mod => mod.ArrowLeftOutlined),
  { ssr: false }
)

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
            onClick={() => router.push(`/admin/meetings`)}
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
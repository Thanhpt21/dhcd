// src/app/admin/meetings/[id]/agendas/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import AgendaManagement from '@/components/admin/agenda/AgendaManagement'
import { useMeetingOne } from '@/hooks/meeting/useMeetingOne'

const { Title } = Typography

export default function AgendaPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = parseInt(params.id as string)

  const { data: meeting, isLoading } = useMeetingOne(meetingId)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!meeting) {
    return <div>Không tìm thấy cuộc họp</div>
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
        <Title level={4} className="!mb-0">
          Quản lý Chương trình Nghị sự - {meeting.meetingCode}
        </Title>
      </div>
      
      <AgendaManagement
        meetingId={meetingId}
        meetingCode={meeting.meetingCode}
        meetingName={meeting.meetingName}
      />
    </div>
  )
}
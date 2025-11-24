// src/app/admin/meetings/page.tsx
'use client'

import MeetingTable from '@/components/admin/meeting/MeetingTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminMeetingPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý cuộc họp</Title>
      <MeetingTable />
    </div>
  )
}
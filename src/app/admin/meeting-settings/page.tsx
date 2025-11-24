// src/app/admin/meeting-settings/page.tsx
'use client'

import MeetingSettingTable from '@/components/admin/meeting-setting/MeetingSettingTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminMeetingSettingPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý cài đặt cuộc họp</Title>
      <MeetingSettingTable />
    </div>
  )
}
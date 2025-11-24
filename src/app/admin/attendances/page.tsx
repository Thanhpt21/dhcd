// src/app/admin/attendances/page.tsx
'use client'

import AttendanceTable from '@/components/admin/attendance/AttendanceTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminAttendancesPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý điểm danh</Title>
      <AttendanceTable />
    </div>
  )
}
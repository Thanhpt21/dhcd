// src/app/admin/registrations/page.tsx
'use client'

import RegistrationTable from '@/components/admin/registration/RegistrationTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminRegistrationsPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý đăng ký tham dự</Title>
      <RegistrationTable />
    </div>
  )
}
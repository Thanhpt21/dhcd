// src/app/admin/shareholders/page.tsx
'use client'

import ShareholderTable from '@/components/admin/shareholder/ShareholderTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminShareholderPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý cổ đông</Title>
      <ShareholderTable />
    </div>
  )
}
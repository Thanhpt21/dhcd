// src/app/admin/email-templates/page.tsx
'use client'

import { Card } from 'antd'
import EmailTemplatesTable from '@/components/admin/email/EmailTemplatesTable'

export default function EmailTemplatesPage() {
  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Email Templates</h1>
          <p className="text-gray-600">
            Tạo và quản lý các mẫu email tự động gửi cho cổ đông
          </p>
        </div>
        
        <EmailTemplatesTable />
      </Card>
    </div>
  )
}
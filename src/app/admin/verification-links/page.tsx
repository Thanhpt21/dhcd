// src/app/admin/verification-links/page.tsx
'use client'

import { Card } from 'antd'
import VerificationLinksTable from '@/components/admin/verification/VerificationLinksTable'

export default function VerificationLinksPage() {
  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Link Xác Thực</h1>
          <p className="text-gray-600">
            Tạo và quản lý các link xác thực cho cổ đông tham gia cuộc họp
          </p>
        </div>
        
        <VerificationLinksTable />
      </Card>
    </div>
  )
}
'use client'

import ReportTemplatesTable from '@/components/admin/reports-template/ReportTemplatesTable'
import { Card } from 'antd'


export default function ReportTemplatesPage() {
  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Report Templates</h1>
          <p className="text-gray-600">
            Tạo và quản lý các mẫu báo cáo tự động cho cuộc họp
          </p>
        </div>
        
        <ReportTemplatesTable />
      </Card>
    </div>
  )
}
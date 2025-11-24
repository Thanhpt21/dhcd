'use client'

import GeneratedReportsTable from '@/components/admin/reports-template/GeneratedReportsTable'
import { Card, Tabs } from 'antd'


const { TabPane } = Tabs

export default function ReportsPage() {
  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Báo Cáo</h1>
          <p className="text-gray-600">
            Quản lý mẫu báo cáo và xem lịch sử các báo cáo đã tạo
          </p>
        </div>
            <GeneratedReportsTable />
      </Card>
    </div>
  )
}
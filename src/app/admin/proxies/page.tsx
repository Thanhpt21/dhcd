// src/app/admin/proxies/page.tsx
'use client'

import ProxyTable from '@/components/admin/proxy/ProxyTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminProxyPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý ủy quyền</Title>
      <ProxyTable />
    </div>
  )
}
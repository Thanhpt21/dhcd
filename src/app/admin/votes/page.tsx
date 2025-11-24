// src/app/admin/votes/page.tsx
'use client'

import { Card, Typography } from 'antd'
import VoteManagement from '@/components/admin/vote/VoteManagement'

const { Title } = Typography

export default function VotePage() {
  return (
    <div className="p-4">
      <Title level={4} className="!mb-4">Quản lý Phiếu bầu</Title>
      <VoteManagement />
    </div>
  )
}
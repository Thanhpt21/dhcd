'use client'

import PromptAITable from '@/components/admin/promptAI/PromptAITable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminPromptAIPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý Prompt AI</Title>
      <PromptAITable />
    </div>
  )
}

// src/app/admin/questions/page.tsx
'use client'

import QuestionTable from '@/components/admin/questions/QuestionTable'
import { Typography, Card } from 'antd'

const { Title } = Typography

export default function AdminQuestionPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý câu hỏi</Title>
      <Card>
        <QuestionTable />
      </Card>
    </div>
  )
}
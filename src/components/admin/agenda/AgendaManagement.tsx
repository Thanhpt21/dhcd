// src/components/admin/agenda/AgendaManagement.tsx
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic } from 'antd'
import { PlusOutlined, BarChartOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useMeetingAgendas } from '@/hooks/agenda/useMeetingAgendas'
import { useAgendaStatistics } from '@/hooks/agenda/useAgendaStatistics'
import AgendaList from './AgendaList'
import AgendaForm from './AgendaForm'
import AgendaTimeline from './AgendaTimeline'
import type { Agenda } from '@/types/agenda.type'

interface AgendaManagementProps {
  meetingId: number
  meetingCode: string
  meetingName: string
}

export default function AgendaManagement({ 
  meetingId, 
  meetingCode, 
  meetingName 
}: AgendaManagementProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null)

  const { data: agendas, isLoading, refetch } = useMeetingAgendas(meetingId)
  const { data: statistics } = useAgendaStatistics(meetingId)

  const handleCreateSuccess = () => {
    setOpenCreate(false)
    refetch?.()
    message.success('Tạo chương trình nghị sự thành công')
  }

  const handleUpdateSuccess = () => {
    setSelectedAgenda(null)
    refetch?.()
    message.success('Cập nhật chương trình nghị sự thành công')
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <FileTextOutlined />
          <span>Danh sách Chương trình</span>
          <span className="text-gray-500">({agendas?.length || 0})</span>
        </Space>
      ),
      children: (
        <AgendaList
          agendas={agendas || []}
          loading={isLoading}
          onEdit={setSelectedAgenda}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: 'timeline',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>Timeline</span>
        </Space>
      ),
      children: <AgendaTimeline meetingId={meetingId} />,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {meetingName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600">Mã cuộc họp:</span>
              <span className="font-semibold">{meetingCode}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tổng chương trình</div>
            <div className="text-2xl font-bold text-blue-600">
              {agendas?.length || 0}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Quản lý Chương trình Nghị sự"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Thêm Chương trình
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Create Modal */}
      <AgendaForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleCreateSuccess}
        meetingId={meetingId}
      />

      {/* Update Modal */}
      <AgendaForm
        open={!!selectedAgenda}
        onClose={() => setSelectedAgenda(null)}
        onSuccess={handleUpdateSuccess}
        meetingId={meetingId}
        agenda={selectedAgenda}
        isEdit
      />
    </div>
  )
}
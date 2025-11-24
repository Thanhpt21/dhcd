// src/components/admin/vote/VoteManagement.tsx
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic } from 'antd'
import { ExportOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons'
import { useVotes } from '@/hooks/vote/useVotes'
import { useVotingStatistics } from '@/hooks/vote/useVotingStatistics'
import VoteList from './VoteList'
import VoteStatistics from './VoteStatistics'
import { useExportVotes } from '@/hooks/vote/useExportVotes'

interface VoteManagementProps {
  meetingId?: number
  resolutionId?: number
}

export default function VoteManagement({ 
  meetingId,
  resolutionId 
}: VoteManagementProps) {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedResolutionId, setSelectedResolutionId] = useState<number | undefined>(resolutionId)

  const { data: votes, isLoading, refetch } = useVotes({
    resolutionId: selectedResolutionId?.toString(),
    meetingId: meetingId?.toString()
  })

  const { data: statistics } = useVotingStatistics(meetingId || 0)
  const { mutateAsync: exportVotes } = useExportVotes()

  console.log("selectedResolutionId",selectedResolutionId)


  const handleExport = async () => {
    if (!selectedResolutionId) {
      message.warning('Vui lòng chọn một nghị quyết để export')
      return
    }

    try {
      const blob = await exportVotes(selectedResolutionId)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `voting_results_${selectedResolutionId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Export kết quả bỏ phiếu thành công')
    } catch (error: any) {
      message.error('Export thất bại: ' + error.message)
    }
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <FileTextOutlined />
          <span>Danh sách Phiếu bầu</span>
        </Space>
      ),
      children: (
        <VoteList
          votes={votes?.data || []}
          loading={isLoading}
          onRefresh={refetch}
          onResolutionChange={setSelectedResolutionId}
          currentResolutionId={selectedResolutionId}
        />
      ),
    },
    {
      key: 'statistics',
      label: (
        <Space>
          <BarChartOutlined />
          <span>Thống kê Bỏ phiếu</span>
        </Space>
      ),
      children: <VoteStatistics meetingId={meetingId} resolutionId={resolutionId} />,
    },
  ]

  return (
    <div className="space-y-4">


      <Card
        title="Quản lý Phiếu bầu"
        extra={
          <Space>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={!selectedResolutionId}
            >
              Export Kết quả
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  )
}
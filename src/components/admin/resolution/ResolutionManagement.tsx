// src/components/admin/resolution/ResolutionManagement.tsx
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic } from 'antd'
import { PlusOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons'
import { useMeetingResolutions } from '@/hooks/resolution/useMeetingResolutions'
import { useResolutionStatistics } from '@/hooks/resolution/useResolutionStatistics'
import ResolutionList from './ResolutionList'
import ResolutionForm from './ResolutionForm'
import ResolutionStatistics from './ResolutionStatistics'
import type { Resolution } from '@/types/resolution.type'

interface ResolutionManagementProps {
  meetingId: number
}

export default function ResolutionManagement({ meetingId }: ResolutionManagementProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null)

  const { data: resolutions, isLoading, refetch } = useMeetingResolutions(meetingId)
  const { data: statistics } = useResolutionStatistics(meetingId)

  console.log("resolutions", resolutions)

  const handleCreateSuccess = () => {
    setOpenCreate(false)
    refetch?.()
    message.success('Tạo nghị quyết thành công')
  }

  const handleUpdateSuccess = () => {
    setSelectedResolution(null)
    refetch?.()
    message.success('Cập nhật nghị quyết thành công')
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <FileTextOutlined />
          <span>Danh sách Nghị quyết</span>
          <span className="text-gray-500">({resolutions?.length || 0})</span>
        </Space>
      ),
      children: (
        <ResolutionList
          resolutions={resolutions || []}
          loading={isLoading}
          onEdit={setSelectedResolution}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: 'statistics',
      label: (
        <Space>
          <BarChartOutlined />
          <span>Thống kê</span>
        </Space>
      ),
      children: <ResolutionStatistics meetingId={meetingId} />,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Statistics Cards - Hiển thị trên cả 2 tabs */}
      {statistics && activeTab === 'list' && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số nghị quyết"
                value={statistics.totalResolutions}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang hoạt động"
                value={statistics.activeResolutions}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng phiếu bầu"
                value={statistics.totalVotes}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tỷ lệ chấp thuận TB"
                value={statistics.averageApprovalThreshold}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title="Quản lý Nghị quyết"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Tạo Nghị quyết
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
      <ResolutionForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleCreateSuccess}
        meetingId={meetingId}
      />

      {/* Update Modal */}
      <ResolutionForm
        open={!!selectedResolution}
        onClose={() => setSelectedResolution(null)}
        onSuccess={handleUpdateSuccess}
        meetingId={meetingId}
        resolution={selectedResolution}
        isEdit
      />
    </div>
  )
}
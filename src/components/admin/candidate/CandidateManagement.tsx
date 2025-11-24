// src/components/admin/candidate/CandidateManagement.tsx (cập nhật)
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic, Alert, Tag } from 'antd'
import { PlusOutlined, BarChartOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useResolutionCandidates } from '@/hooks/candidate/useResolutionCandidates'
import { useCandidateStatistics } from '@/hooks/candidate/useCandidateStatistics'
import CandidateList from './CandidateList'
import CandidateForm from './CandidateForm'
import CandidateStatistics from './CandidateStatistics'
import type { ResolutionCandidate } from '@/types/candidate.type'

interface CandidateManagementProps {
  resolutionId: number
  resolutionCode: string
  resolutionTitle: string
}

export default function CandidateManagement({ 
  resolutionId, 
  resolutionCode, 
  resolutionTitle 
}: CandidateManagementProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedCandidate, setSelectedCandidate] = useState<ResolutionCandidate | null>(null)

  const { data: candidates, isLoading, refetch } = useResolutionCandidates(resolutionId)
  const { data: statistics } = useCandidateStatistics(resolutionId)

  const handleCreateSuccess = () => {
    setOpenCreate(false)
    refetch?.()
    message.success('Tạo ứng cử viên thành công')
  }

  const handleUpdateSuccess = () => {
    setSelectedCandidate(null)
    refetch?.()
    message.success('Cập nhật ứng cử viên thành công')
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <UserOutlined />
          <span>Danh sách Ứng cử viên</span>
        </Space>
      ),
      children: (
        <CandidateList
          candidates={candidates || []}
          loading={isLoading}
          onEdit={setSelectedCandidate}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: 'statistics',
      label: (
        <Space>
          <BarChartOutlined />
          <span>Thống kê Bầu cử</span>
        </Space>
      ),
      children: <CandidateStatistics resolutionId={resolutionId} />,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {resolutionTitle}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600">Mã nghị quyết:</span>
              <span className="font-semibold">{resolutionCode}</span>
              {statistics?.topCandidate && (
                <Tag color="gold">
                  Đang dẫn đầu: {statistics.topCandidate.candidateName}
                </Tag>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tổng ứng cử viên</div>
            <div className="text-2xl font-bold text-blue-600">
              {candidates?.length || 0}
            </div>
          </div>
        </div>
      </Card>

      {/* Alert for empty candidates */}
      {candidates?.length === 0 && activeTab === 'list' && (
        <Alert
          message="Chưa có ứng cử viên nào"
          description="Hãy thêm ứng cử viên đầu tiên để bắt đầu quá trình bầu cử."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => setOpenCreate(true)}>
              Thêm ngay
            </Button>
          }
        />
      )}

      {/* Statistics Cards - Hiển thị trên tab list */}
      {statistics && activeTab === 'list' && candidates && candidates.length > 0 && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng ứng cử viên"
                value={statistics.totalCandidates}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã trúng cử"
                value={statistics.electedCandidates}
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
                title="Phiếu trung bình"
                value={statistics.averageVotesPerCandidate}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title="Quản lý Ứng cử viên"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Thêm Ứng cử viên
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
      <CandidateForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleCreateSuccess}
        resolutionId={resolutionId}
      />

      {/* Update Modal */}
      <CandidateForm
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onSuccess={handleUpdateSuccess}
        resolutionId={resolutionId}
        candidate={selectedCandidate}
        isEdit
      />
    </div>
  )
}
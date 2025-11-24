// src/components/admin/resolution/ResolutionStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useResolutionStatistics } from '@/hooks/resolution/useResolutionStatistics'
import { VotingMethod } from '@/types/resolution.type'
import type { Resolution } from '@/types/resolution.type'

interface ResolutionStatisticsProps {
  meetingId: number
}

interface ResolutionStats {
  totalResolutions: number
  activeResolutions: number
  inactiveResolutions: number
  yesNoResolutions: number
  multipleChoiceResolutions: number
  rankingResolutions: number
  totalVotes: number
  totalCandidates: number
  averageApprovalThreshold: number
}

export default function ResolutionStatistics({ meetingId }: ResolutionStatisticsProps) {
  const { data: statistics, isLoading } = useResolutionStatistics(meetingId)

  if (!statistics) return null

  const stats = statistics as ResolutionStats

  const getVotingMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'YES_NO': 'blue',
      'MULTIPLE_CHOICE': 'green',
      'RANKING': 'orange'
    }
    return colors[method] || 'default'
  }

  const getVotingMethodText = (method: string) => {
    const texts: Record<string, string> = {
      'YES_NO': 'Có/Không',
      'MULTIPLE_CHOICE': 'Nhiều lựa chọn',
      'RANKING': 'Xếp hạng'
    }
    return texts[method] || method
  }

  // Data for voting methods distribution
  const votingMethodData = [
    {
      key: '1',
      method: 'YES_NO',
      name: 'Bỏ phiếu Có/Không',
      count: stats.yesNoResolutions,
      percentage: ((stats.yesNoResolutions / stats.totalResolutions) * 100).toFixed(1)
    },
    {
      key: '2',
      method: 'MULTIPLE_CHOICE',
      name: 'Nhiều lựa chọn',
      count: stats.multipleChoiceResolutions,
      percentage: ((stats.multipleChoiceResolutions / stats.totalResolutions) * 100).toFixed(1)
    },
    {
      key: '3',
      method: 'RANKING',
      name: 'Xếp hạng',
      count: stats.rankingResolutions,
      percentage: ((stats.rankingResolutions / stats.totalResolutions) * 100).toFixed(1)
    }
  ]

  const votingMethodColumns: ColumnsType<any> = [
    {
      title: 'Phương thức',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Tag color={getVotingMethodColor(record.method)}>
            {getVotingMethodText(record.method)}
          </Tag>
          {name}
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      align: 'center' as const,
      render: (count: number) => (
        <span className="font-semibold">{count}</span>
      ),
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center' as const,
      render: (percentage: string) => (
        <div className="text-center">
          <div className="font-semibold">{percentage}%</div>
          <Progress 
            percent={parseFloat(percentage)} 
            size="small" 
            showInfo={false}
            strokeColor={
              parseFloat(percentage) > 50 ? '#52c41a' : 
              parseFloat(percentage) > 25 ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số nghị quyết"
              value={stats.totalResolutions}
              valueStyle={{ color: '#1890ff' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.activeResolutions}
              valueStyle={{ color: '#3f8600' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng phiếu bầu"
              value={stats.totalVotes}
              valueStyle={{ color: '#722ed1' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng ứng viên"
              value={stats.totalCandidates}
              valueStyle={{ color: '#fa8c16' }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Cards */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Trạng thái Nghị quyết" loading={isLoading}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Đang hoạt động</span>
                <div className="text-right">
                  <div className="font-semibold">{stats.activeResolutions}</div>
                  <Progress 
                    percent={((stats.activeResolutions / stats.totalResolutions) * 100)} 
                    size="small" 
                    strokeColor="#52c41a"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Đã vô hiệu hóa</span>
                <div className="text-right">
                  <div className="font-semibold">{stats.inactiveResolutions}</div>
                  <Progress 
                    percent={((stats.inactiveResolutions / stats.totalResolutions) * 100)} 
                    size="small" 
                    strokeColor="#ff4d4f"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Ngưỡng chấp thuận Trung bình" loading={isLoading}>
            <div className="text-center py-4">
              <Progress
                type="circle"
                percent={parseFloat(stats.averageApprovalThreshold.toString())}
                format={percent => (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{percent}%</div>
                    <div className="text-sm text-gray-500">Trung bình</div>
                  </div>
                )}
                strokeColor={
                  parseFloat(stats.averageApprovalThreshold.toString()) >= 75 ? '#52c41a' :
                  parseFloat(stats.averageApprovalThreshold.toString()) >= 50 ? '#faad14' : '#ff4d4f'
                }
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Voting Methods Distribution */}
      <Card 
        title="Phân bổ Phương thức Bỏ phiếu" 
        loading={isLoading}
        extra={<Tag color="blue">Tổng: {stats.totalResolutions} nghị quyết</Tag>}
      >
        <Table
          columns={votingMethodColumns}
          dataSource={votingMethodData}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Summary Cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Card className="text-center" loading={isLoading}>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.yesNoResolutions}
            </div>
            <div className="text-gray-600">Nghị quyết Có/Không</div>
            <Tag color="blue" className="mt-2">
              {((stats.yesNoResolutions / stats.totalResolutions) * 100).toFixed(1)}%
            </Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="text-center" loading={isLoading}>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.multipleChoiceResolutions}
            </div>
            <div className="text-gray-600">Nghị quyết Nhiều lựa chọn</div>
            <Tag color="green" className="mt-2">
              {((stats.multipleChoiceResolutions / stats.totalResolutions) * 100).toFixed(1)}%
            </Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="text-center" loading={isLoading}>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.rankingResolutions}
            </div>
            <div className="text-gray-600">Nghị quyết Xếp hạng</div>
            <Tag color="orange" className="mt-2">
              {((stats.rankingResolutions / stats.totalResolutions) * 100).toFixed(1)}%
            </Tag>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
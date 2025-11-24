// src/components/admin/vote/VoteStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Empty, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useVotingStatistics } from '@/hooks/vote/useVotingStatistics'
import { useVotingResults } from '@/hooks/vote/useVotingResults'
import { useResolutions } from '@/hooks/resolution/useResolutions'
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import type { VotingMethod } from '@/types/vote.type'

interface VoteStatisticsProps {
  meetingId?: number
  resolutionId?: number
}

export default function VoteStatistics({ meetingId, resolutionId }: VoteStatisticsProps) {
  const { data: statistics, isLoading: statsLoading } = useVotingStatistics(meetingId || 0)
  const { data: votingResults, isLoading: resultsLoading } = useVotingResults(resolutionId || 0)
  const { data: resolutionsData } = useResolutions({
    meetingId: meetingId?.toString()
  })

  const isLoading = statsLoading || resultsLoading

  // Statistics for meeting level
  const renderMeetingStatistics = () => {
    if (!statistics) return <Empty description="Không có dữ liệu thống kê" />

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng nghị quyết"
                value={statistics.totalResolutions}
                valueStyle={{ color: '#1890ff' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng phiếu bầu"
                value={statistics.totalVotes}
                valueStyle={{ color: '#3f8600' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cổ đông tham gia"
                value={statistics.totalShareholders}
                valueStyle={{ color: '#722ed1' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tỷ lệ tham gia"
                value={statistics.participationRate}
                suffix="%"
                valueStyle={{ color: '#fa8c16' }}
                loading={isLoading}
              />
            </Card>
          </Col>
        </Row>

        {/* Resolution Progress */}
        <Card title="Tiến độ Bỏ phiếu theo Nghị quyết" loading={isLoading}>
          <div className="space-y-4">
            {statistics.resolutions.map((resolution: any) => (
              <div key={resolution.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{resolution.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Tag color={getVotingMethodColor(resolution.votingMethod)}>
                      {getVotingMethodText(resolution.votingMethod)}
                    </Tag>
                    <Tag color={getApprovalStatusColor(resolution.approvalStatus)}>
                      {getApprovalStatusText(resolution.approvalStatus)}
                    </Tag>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{resolution.totalVotes} phiếu</div>
                  <Progress 
                    percent={Math.min((resolution.totalVotes / (statistics.totalShareholders || 1)) * 100, 100)} 
                    size="small" 
                    strokeColor={
                      resolution.totalVotes > statistics.totalShareholders * 0.5 ? '#52c41a' :
                      resolution.totalVotes > statistics.totalShareholders * 0.25 ? '#faad14' : '#ff4d4f'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Statistics for resolution level
  const renderResolutionStatistics = () => {
    if (!votingResults) return <Empty description="Không có dữ liệu kết quả bỏ phiếu" />

    const { resolution, summary, detailedResults } = votingResults

    return (
      <div className="space-y-6">
        {/* Resolution Header */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{resolution.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Tag color="blue">{resolution.resolutionCode}</Tag>
                <Tag color={getVotingMethodColor(resolution.votingMethod)}>
                  {getVotingMethodText(resolution.votingMethod)}
                </Tag>
                <Tag color={getApprovalStatusColor(summary.isApproved ? 'APPROVED' : 'REJECTED')}>
                  {summary.isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA'}
                </Tag>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {summary.approvalRate}%
              </div>
              <div className="text-gray-600">Tỷ lệ đồng ý</div>
            </div>
          </div>
        </Card>

        {/* Voting Results based on method */}
        {resolution.votingMethod === 'YES_NO' && renderYesNoResults(summary)}
        {resolution.votingMethod === 'MULTIPLE_CHOICE' && renderMultipleChoiceResults(summary)}
        {resolution.votingMethod === 'RANKING' && renderRankingResults(summary)}

        {/* Detailed Results Table */}
        <Card title="Chi tiết Phiếu bầu">
          <Table
            columns={getDetailedResultsColumns()}
            dataSource={detailedResults}
            pagination={false}
            scroll={{ x: 800 }}
            loading={isLoading}
          />
        </Card>
      </div>
    )
  }

  const renderYesNoResults = (summary: any) => (
    <Row gutter={16}>
      <Col span={8}>
        <Card className="text-center">
          <Statistic
            title="Đồng ý"
            value={summary.yesShares}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
          />
          <Progress 
            percent={summary.totalSharesVoted > 0 ? (summary.yesShares / summary.totalSharesVoted * 100) : 0} 
            strokeColor="#52c41a"
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="text-center">
          <Statistic
            title="Không đồng ý"
            value={summary.noShares}
            valueStyle={{ color: '#cf1322' }}
            prefix={<CloseCircleOutlined />}
          />
          <Progress 
            percent={summary.totalSharesVoted > 0 ? (summary.noShares / summary.totalSharesVoted * 100) : 0} 
            strokeColor="#ff4d4f"
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="text-center">
          <Statistic
            title="Không ý kiến"
            value={summary.abstainShares}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<BarChartOutlined />}
          />
          <Progress 
            percent={summary.totalSharesVoted > 0 ? (summary.abstainShares / summary.totalSharesVoted * 100) : 0} 
            strokeColor="#faad14"
          />
        </Card>
      </Col>
    </Row>
  )

  const renderMultipleChoiceResults = (summary: any) => (
    <Card title="Kết quả Bầu cử">
      <div className="space-y-4">
        {summary.candidates.map((candidate: any, index: number) => (
          <div key={candidate.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {index < 3 && <TrophyOutlined className="text-yellow-600 text-lg" />}
              <div>
                <div className="font-semibold">{candidate.candidateName}</div>
                <div className="text-sm text-gray-500">{candidate.candidateCode}</div>
              </div>
              {candidate.isElected && (
                <Tag color="green">Trúng cử</Tag>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">{candidate.voteCount.toLocaleString()} phiếu</div>
              <div className="text-gray-600">{candidate.votePercentage}%</div>
              <Progress 
                percent={parseFloat(candidate.votePercentage)} 
                size="small" 
                strokeColor={candidate.isElected ? '#52c41a' : '#1890ff'}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderRankingResults = (summary: any) => (
    <Card title="Kết quả Xếp hạng">
      <Table
        columns={[
          {
            title: 'Hạng',
            dataIndex: 'averageRank',
            key: 'rank',
            width: 80,
            render: (rank: number, record: any, index: number) => (
              <div className="text-center">
                {index + 1 <= 3 ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    index + 1 === 1 ? 'bg-yellow-100 text-yellow-600' :
                    index + 1 === 2 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <TrophyOutlined />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-sm">
                    {index + 1}
                  </div>
                )}
              </div>
            ),
          },
          {
            title: 'Ứng cử viên',
            dataIndex: 'candidateName',
            key: 'candidateName',
          },
          {
            title: 'Thứ hạng TB',
            dataIndex: 'averageRank',
            key: 'averageRank',
            render: (rank: number) => rank.toFixed(2),
          },
           {
          title: 'Phân bổ Hạng',
          dataIndex: 'rankDistribution',
          key: 'rankDistribution',
          render: (distribution: Record<string, number>) => ( // Xác định kiểu rõ ràng
            <Space>
              {Object.entries(distribution)
                .slice(0, 3)
                .map(([rank, count]) => (
                  <Tag key={rank}>
                    H{rank}: {count as number} {/* Ép kiểu count thành number */}
                  </Tag>
                ))}
            </Space>
          ),
        },
        ]}
        dataSource={summary.candidates}
        pagination={false}
      />
    </Card>
  )

  const getDetailedResultsColumns = (): ColumnsType<any> => [
    {
      title: 'Cổ đông',
      dataIndex: ['shareholder', 'fullName'],
      key: 'shareholderName',
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'voteType',
      key: 'voteType',
      render: (type: string) => (
        <Tag color={getVoteTypeColor(type)}>
          {getVoteTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Cổ phần sử dụng',
      dataIndex: 'sharesUsed',
      key: 'sharesUsed',
      render: (shares: number) => shares.toLocaleString(),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ]

  // Utility functions
  const getVotingMethodColor = (method: VotingMethod) => {
    const colors: Record<string, string> = {
      'YES_NO': 'blue',
      'MULTIPLE_CHOICE': 'green',
      'RANKING': 'orange'
    }
    return colors[method] || 'default'
  }

  const getVotingMethodText = (method: VotingMethod) => {
    const texts: Record<string, string> = {
      'YES_NO': 'Có/Không',
      'MULTIPLE_CHOICE': 'Nhiều lựa chọn',
      'RANKING': 'Xếp hạng'
    }
    return texts[method]
  }

  const getApprovalStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'APPROVED': 'green',
      'REJECTED': 'red',
      'NO_VOTES': 'default'
    }
    return colors[status] || 'default'
  }

  const getApprovalStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'APPROVED': 'Đã thông qua',
      'REJECTED': 'Không thông qua',
      'NO_VOTES': 'Chưa có phiếu'
    }
    return texts[status]
  }

  const getVoteTypeColor = (type: string) => {
    if (type.includes('RANK')) return 'orange'
    if (type === 'SELECTED') return 'green'
    if (type === 'YES') return 'green'
    if (type === 'NO') return 'red'
    if (type === 'ABSTAIN') return 'orange'
    return 'blue'
  }

  const getVoteTypeText = (type: string) => {
    if (type.includes('RANK_')) return `Hạng ${type.replace('RANK_', '')}`
    if (type === 'SELECTED') return 'Được chọn'
    if (type === 'YES') return 'Đồng ý'
    if (type === 'NO') return 'Không đồng ý'
    if (type === 'ABSTAIN') return 'Không ý kiến'
    return type
  }

  const tabItems = [
    {
      key: 'meeting',
      label: 'Thống kê Cuộc họp',
      children: renderMeetingStatistics(),
      disabled: !meetingId
    },
    {
      key: 'resolution',
      label: 'Kết quả Nghị quyết',
      children: renderResolutionStatistics(),
      disabled: !resolutionId
    },
  ]

  return (
    <div>
      <Tabs
        items={tabItems}
        defaultActiveKey={resolutionId ? 'resolution' : 'meeting'}
      />
    </div>
  )
}
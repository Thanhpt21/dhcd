// src/components/admin/candidate/CandidateStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCandidateStatistics } from '@/hooks/candidate/useCandidateStatistics'
import { useResolutionCandidates } from '@/hooks/candidate/useResolutionCandidates'
import { TrophyOutlined, UserOutlined, BarChartOutlined, CrownOutlined } from '@ant-design/icons'
import type { ResolutionCandidate } from '@/types/candidate.type'

interface CandidateStatisticsProps {
  resolutionId: number
}

interface CandidateStats {
  totalCandidates: number
  electedCandidates: number
  totalVotes: number
  averageVotesPerCandidate: number
  topCandidate: ResolutionCandidate | null
}

export default function CandidateStatistics({ resolutionId }: CandidateStatisticsProps) {
  const { data: statistics, isLoading: statsLoading } = useCandidateStatistics(resolutionId)
  const { data: candidates, isLoading: candidatesLoading } = useResolutionCandidates(resolutionId)

  const isLoading = statsLoading || candidatesLoading

  if (!statistics && !isLoading) {
    return (
      <Card>
        <Empty description="Không có dữ liệu thống kê" />
      </Card>
    )
  }

  const stats = statistics as CandidateStats

  // Prepare data for ranking table
  const rankingData = candidates?.map((candidate: any, index: any) => ({
    key: candidate.id,
    rank: index + 1,
    ...candidate,
    votePercentage: stats.totalVotes > 0 ? (candidate.voteCount / stats.totalVotes) * 100 : 0
  })).sort((a: any, b: any) => b.voteCount - a.voteCount) || []

  // Top 3 candidates
  const topCandidates = rankingData.slice(0, 3)

  const rankingColumns: ColumnsType<any> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number, record: any) => (
        <div className="text-center">
          {rank <= 3 ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
              rank === 1 ? 'bg-yellow-100 text-yellow-600' :
              rank === 2 ? 'bg-gray-100 text-gray-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              <CrownOutlined />
            </div>
          ) : (
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-sm">
              {rank}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ứng cử viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (name: string, record: any) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{record.candidateCode}</div>
          </div>
          {record.isElected && (
            <TrophyOutlined style={{ color: '#faad14' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Số phiếu',
      dataIndex: 'voteCount',
      key: 'voteCount',
      width: 120,
      render: (votes: number) => (
        <div className="text-center">
          <div className="font-semibold text-lg">{votes.toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: 'Tỷ lệ phiếu',
      dataIndex: 'votePercentage',
      key: 'votePercentage',
      width: 200,
      render: (percentage: number, record: any) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{percentage.toFixed(1)}%</span>
            <span>{record.voteCount.toLocaleString()} phiếu</span>
          </div>
          <Progress 
            percent={percentage} 
            size="small" 
            showInfo={false}
            strokeColor={
              percentage > 30 ? '#52c41a' : 
              percentage > 15 ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isElected',
      key: 'isElected',
      width: 100,
      render: (isElected: boolean) => (
        <Tag color={isElected ? 'green' : 'default'}>
          {isElected ? 'Đã trúng cử' : 'Đang bầu cử'}
        </Tag>
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
              title="Tổng ứng cử viên"
              value={stats?.totalCandidates || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã trúng cử"
              value={stats?.electedCandidates || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TrophyOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng phiếu bầu"
              value={stats?.totalVotes || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<BarChartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phiếu trung bình"
              value={stats?.averageVotesPerCandidate || 0}
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Candidates Podium */}
      {topCandidates.length > 0 && (
        <Card title="Top Ứng cử viên" loading={isLoading}>
          <div className="flex justify-center items-end gap-8 py-6">
            {topCandidates.map((candidate: any, index: any) => (
              <div 
                key={candidate.id}
                className={`text-center ${
                  index === 0 ? 'order-2' : 
                  index === 1 ? 'order-1' : 'order-3'
                }`}
              >
                <div className={`
                  flex flex-col items-center justify-end
                  ${index === 0 ? 'h-32 bg-yellow-100' : 
                    index === 1 ? 'h-24 bg-gray-100' : 
                    'h-20 bg-orange-100'}
                  rounded-t-lg p-4 border
                `}>
                  {index === 0 && <CrownOutlined className="text-yellow-600 text-2xl mb-2" />}
                  <div className={`font-semibold ${index === 0 ? 'text-lg' : 'text-base'}`}>
                    {candidate.candidateName}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {candidate.voteCount.toLocaleString()} phiếu
                  </div>
                </div>
                <div className={`
                  py-2 font-bold
                  ${index === 0 ? 'text-yellow-600' : 
                    index === 1 ? 'text-gray-600' : 
                    'text-orange-600'}
                `}>
                  Hạng {index + 1}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Election Progress */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Tiến độ Bầu cử" loading={isLoading}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Ứng cử viên đã trúng cử</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {stats?.electedCandidates || 0} / {stats?.totalCandidates || 0}
                  </div>
                  <Progress 
                    percent={stats?.totalCandidates ? 
                      ((stats.electedCandidates / stats.totalCandidates) * 100) : 0
                    } 
                    size="small" 
                    strokeColor="#52c41a"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Tỷ lệ tham gia bầu cử</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {stats?.totalVotes ? stats.totalVotes.toLocaleString() : 0} phiếu
                  </div>
                  <Progress 
                    percent={stats?.totalVotes ? Math.min((stats.totalVotes / 1000) * 100, 100) : 0} 
                    size="small" 
                    strokeColor="#1890ff"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân bổ Phiếu bầu" loading={isLoading}>
            {topCandidates.length > 0 ? (
              <div className="space-y-3">
                {topCandidates.map((candidate: any, index: any) => (
                  <div key={candidate.id} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      {index === 0 && <CrownOutlined className="text-yellow-600" />}
                      {index === 1 && <CrownOutlined className="text-gray-500" />}
                      {index === 2 && <CrownOutlined className="text-orange-500" />}
                      <span className="truncate max-w-[120px]">{candidate.candidateName}</span>
                    </span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {((candidate.voteCount / (stats?.totalVotes || 1)) * 100).toFixed(1)}%
                      </div>
                      <Progress 
                        percent={(candidate.voteCount / (stats?.totalVotes || 1)) * 100} 
                        size="small" 
                        showInfo={false}
                        strokeColor={
                          index === 0 ? '#faad14' :
                          index === 1 ? '#d9d9d9' :
                          '#ff7a45'
                        }
                      />
                    </div>
                  </div>
                ))}
                {rankingData.length > 3 && (
                  <div className="text-center text-gray-500 text-sm">
                    + {rankingData.length - 3} ứng cử viên khác
                  </div>
                )}
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu phiếu bầu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Full Ranking Table */}
      <Card 
        title="Bảng xếp hạng Ứng cử viên" 
        loading={isLoading}
        extra={
          <Tag color="blue">
            Tổng: {stats?.totalCandidates || 0} ứng cử viên
          </Tag>
        }
      >
        <Table
          columns={rankingColumns}
          dataSource={rankingData}
          pagination={false}
          scroll={{ x: 800 }}
          loading={isLoading}
        />
      </Card>

      {/* Quick Stats */}
      {stats?.topCandidate && (
        <Card title="Ứng cử viên Dẫn đầu" loading={isLoading}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <CrownOutlined className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{stats.topCandidate.candidateName}</h3>
                <p className="text-gray-600">{stats.topCandidate.candidateCode}</p>
                {stats.topCandidate.candidateInfo && (
                  <p className="text-sm text-gray-500 mt-1">{stats.topCandidate.candidateInfo}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {stats.topCandidate.voteCount.toLocaleString()}
              </div>
              <div className="text-gray-600">phiếu bầu</div>
              <Tag color="green" className="mt-2">
                {((stats.topCandidate.voteCount / (stats.totalVotes || 1)) * 100).toFixed(1)}% tổng phiếu
              </Tag>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
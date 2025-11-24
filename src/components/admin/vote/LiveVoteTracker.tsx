// src/components/admin/vote/LiveVoteTracker.tsx
'use client'

import { Card, Statistic, List, Avatar, Tag, Space } from 'antd'
import { UserOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import { useResolutionVotes } from '@/hooks/vote/useResolutionVotes'
import type { Vote } from '@/types/vote.type'

interface LiveVoteTrackerProps {
  resolutionId: number
}

export default function LiveVoteTracker({ resolutionId }: LiveVoteTrackerProps) {
  const { data: votes, isLoading } = useResolutionVotes(resolutionId)

  // Auto-refresh every 10 seconds for live updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetch()
  //   }, 10000)
  //   return () => clearInterval(interval)
  // }, [refetch])

  const recentVotes = votes?.slice(0, 10) || []

  const getVoteIcon = (voteValue: string) => {
    if (voteValue === 'YES') return '✅'
    if (voteValue === 'NO') return '❌'
    if (voteValue === 'ABSTAIN') return '⚪'
    return '📊'
  }

  const getVoteColor = (voteValue: string) => {
    if (voteValue === 'YES') return 'green'
    if (voteValue === 'NO') return 'red'
    if (voteValue === 'ABSTAIN') return 'orange'
    return 'blue'
  }

  return (
    <Card 
      title={
        <Space>
          <BarChartOutlined />
          <span>Theo dõi Phiếu bầu Thời gian thực</span>
          <Tag color="processing">LIVE</Tag>
        </Space>
      }
      loading={isLoading}
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="Tổng phiếu"
            value={votes?.length || 0}
            prefix={<BarChartOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Đồng ý"
            value={votes?.filter((v: Vote) => v.voteValue === 'YES').length || 0}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Không đồng ý"
            value={votes?.filter((v: Vote)  => v.voteValue === 'NO').length || 0}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Không ý kiến"
            value={votes?.filter((v: Vote)  => v.voteValue === 'ABSTAIN').length || 0}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </div>

      <List
        header={<div>Phiếu bầu gần đây</div>}
        dataSource={recentVotes}
        renderItem={(vote: Vote) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Space>
                  <span>{vote.shareholder?.fullName}</span>
                  <Tag color={getVoteColor(vote.voteValue)}>
                    {getVoteIcon(vote.voteValue)} {vote.voteValue}
                  </Tag>
                </Space>
              }
              description={
                <Space>
                  <span>Mã: {vote.shareholder?.shareholderCode}</span>
                  <span>•</span>
                  <span>{vote.sharesUsed.toLocaleString()} cổ phần</span>
                  <span>•</span>
                  <ClockCircleOutlined />
                  <span>{new Date(vote.createdAt).toLocaleTimeString('vi-VN')}</span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
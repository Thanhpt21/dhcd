// src/components/admin/option/OptionStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOptionStatistics } from '@/hooks/option/useOptionStatistics'
import { useResolutionOptions } from '@/hooks/option/useResolutionOptions'
import { CheckOutlined, CloseOutlined, BarChartOutlined, TrophyOutlined } from '@ant-design/icons'
import { ResolutionOption } from '@/types/option.type'


interface OptionStatisticsProps {
  resolutionId: number
}

interface OptionStats {
  totalOptions: number
  totalVotes: number
  averageVotesPerOption: number
  topOption: ResolutionOption | null
}

export default function OptionStatistics({ resolutionId }: OptionStatisticsProps) {
  const { data: statistics, isLoading: statsLoading } = useOptionStatistics(resolutionId)
  const { data: options, isLoading: optionsLoading } = useResolutionOptions(resolutionId)

  const isLoading = statsLoading || optionsLoading

  if (!statistics && !isLoading) {
    return (
      <Card>
        <Empty description="Không có dữ liệu thống kê" />
      </Card>
    )
  }

  const stats = statistics as OptionStats

  // Prepare data for ranking table
  const rankingData = options?.map((option: any, index: any) => ({
    key: option.id,
    rank: index + 1,
    ...option,
    votePercentage: stats.totalVotes > 0 ? (option.voteCount / stats.totalVotes) * 100 : 0
  })).sort((a: any, b: any) => b.voteCount - a.voteCount) || []

  // Top 3 options
  const topOptions = rankingData.slice(0, 3)

  const getOptionIcon = (optionValue: string) => {
    if (optionValue === 'YES') {
      return <CheckOutlined style={{ color: '#52c41a' }} />
    } else if (optionValue === 'NO') {
      return <CloseOutlined style={{ color: '#ff4d4f' }} />
    }
    return <BarChartOutlined style={{ color: '#1890ff' }} />
  }

  const rankingColumns: ColumnsType<any> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div className="text-center">
          {rank <= 3 ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
              rank === 1 ? 'bg-yellow-100 text-yellow-600' :
              rank === 2 ? 'bg-gray-100 text-gray-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              <TrophyOutlined />
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
      title: 'Phương án',
      dataIndex: 'optionText',
      key: 'optionText',
      render: (text: string, record: any) => (
        <Space>
          {getOptionIcon(record.optionValue)}
          <div>
            <div className="font-semibold">{text}</div>
            <div className="text-xs text-gray-500">{record.optionCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'optionValue',
      key: 'optionValue',
      width: 100,
      render: (value: string) => (
        <Tag color={value === 'YES' ? 'green' : value === 'NO' ? 'red' : 'blue'}>
          {value}
        </Tag>
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
              percentage > 50 ? '#52c41a' : 
              percentage > 25 ? '#faad14' : '#ff4d4f'
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
              title="Tổng phương án"
              value={stats?.totalOptions || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng phiếu bầu"
              value={stats?.totalVotes || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BarChartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phiếu trung bình"
              value={stats?.averageVotesPerOption || 0}
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phương án dẫn đầu"
              value={stats?.topOption?.voteCount || 0}
              suffix="phiếu"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Options */}
      {topOptions.length > 0 && (
        <Card title="Top Phương án" loading={isLoading}>
          <div className="flex justify-center items-end gap-8 py-6">
            {topOptions.map((option: any, index: any) => (
              <div 
                key={option.id}
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
                  {getOptionIcon(option.optionValue)}
                  <div className={`font-semibold mt-2 ${index === 0 ? 'text-lg' : 'text-base'}`}>
                    {option.optionText}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {option.voteCount.toLocaleString()} phiếu
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

      {/* Full Ranking Table */}
      <Card 
        title="Bảng xếp hạng Phương án" 
        loading={isLoading}
        extra={
          <Tag color="blue">
            Tổng: {stats?.totalOptions || 0} phương án
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
      {stats?.topOption && (
        <Card title="Phương án Dẫn đầu" loading={isLoading}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrophyOutlined className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{stats.topOption.optionText}</h3>
                <p className="text-gray-600">{stats.topOption.optionCode}</p>
                {stats.topOption.description && (
                  <p className="text-sm text-gray-500 mt-1">{stats.topOption.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {stats.topOption.voteCount.toLocaleString()}
              </div>
              <div className="text-gray-600">phiếu bầu</div>
              <Tag color="green" className="mt-2">
                {((stats.topOption.voteCount / (stats.totalVotes || 1)) * 100).toFixed(1)}% tổng phiếu
              </Tag>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
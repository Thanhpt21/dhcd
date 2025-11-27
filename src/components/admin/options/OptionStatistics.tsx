// src/components/admin/option/OptionStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Empty, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOptionStatistics } from '@/hooks/option/useOptionStatistics'
import { useResolutionOptions } from '@/hooks/option/useResolutionOptions'
import { CheckOutlined, CloseOutlined, BarChartOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons'
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
  const { data: statistics, isLoading: statsLoading, error: statsError } = useOptionStatistics(resolutionId)
  const { data: options, isLoading: optionsLoading, error: optionsError } = useResolutionOptions(resolutionId)

  const isLoading = statsLoading || optionsLoading
  const hasError = statsError || optionsError

  // Debug
  console.log('🔍 Statistics data:', statistics)
  console.log('🔍 Options data:', options)
  console.log('❌ Stats error:', statsError)
  console.log('❌ Options error:', optionsError)

  // ✅ Tính toán statistics từ options nếu API statistics fail
  const calculateStatisticsFromOptions = (): OptionStats => {
    const optionList = options || []
    
    // Tính tổng votes từ tất cả options
    const totalVotes = optionList.reduce((sum: any, option: any) => sum + (option.voteCount || 0), 0)
    
    // Tìm option có voteCount cao nhất
    const topOption = optionList.reduce((max: any, option: any) => 
      (option.voteCount || 0) > (max?.voteCount || 0) ? option : max, null
    )

    return {
      totalOptions: optionList.length,
      totalVotes,
      averageVotesPerOption: optionList.length > 0 ? totalVotes / optionList.length : 0,
      topOption
    }
  }

  // ✅ Sử dụng statistics từ API hoặc tính từ options
  const stats = statistics || calculateStatisticsFromOptions()

  // ✅ Chuẩn bị dữ liệu cho ranking table - SỬA LẠI LOGIC
  const rankingData = (options || [])
    .map((option: any) => ({
      key: option.id,
      ...option,
      voteCount: option.voteCount || 0, // Đảm bảo có voteCount
      votePercentage: stats.totalVotes > 0 ? ((option.voteCount || 0) / stats.totalVotes) * 100 : 0
    }))
    .sort((a: any, b: any) => b.voteCount - a.voteCount) // Sắp xếp theo voteCount giảm dần
    .map((option: any, index: number) => ({
      ...option,
      rank: index + 1 // Gán rank sau khi sắp xếp
    }))

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
            {record.description && (
              <div className="text-xs text-gray-400 mt-1">{record.description}</div>
            )}
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
      sorter: (a: any, b: any) => a.voteCount - b.voteCount,
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
      sorter: (a: any, b: any) => a.votePercentage - b.votePercentage,
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

  // ✅ Xử lý error states
  if (hasError && !options) {
    return (
      <Card>
        <Empty 
          description={
            <div>
              <div>Không thể tải dữ liệu thống kê</div>
              <div className="text-sm text-gray-500 mt-2">
                {statsError?.message || optionsError?.message}
              </div>
            </div>
          } 
        />
      </Card>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Card>
        <Empty description="Chưa có phương án bỏ phiếu nào để thống kê" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hiển thị warning nếu statistics API fail */}
      {statsError && (
        <Alert
          message="Không thể tải thống kê từ server"
          description="Đang hiển thị thống kê tính toán từ dữ liệu phương án"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
        />
      )}

      {/* Overview Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng phương án"
              value={stats.totalOptions}
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
              value={stats.totalVotes}
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
              value={stats.averageVotesPerOption}
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
              value={stats.topOption?.voteCount || 0}
              suffix="phiếu"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Options */}
      {topOptions.length > 0 && (
        <Card title="Top 3 Phương án Được Bầu Chọn" loading={isLoading}>
          <div className="flex justify-center items-end gap-8 py-6">
            {topOptions.map((option: any, index: number) => (
              <div 
                key={option.id}
                className={`text-center ${
                  index === 0 ? 'order-2' : 
                  index === 1 ? 'order-1' : 'order-3'
                }`}
              >
                <div className={`
                  flex flex-col items-center justify-end
                  ${index === 0 ? 'h-32 bg-yellow-100 border-yellow-300' : 
                    index === 1 ? 'h-24 bg-gray-100 border-gray-300' : 
                    'h-20 bg-orange-100 border-orange-300'}
                  rounded-t-lg p-4 border-2
                `}>
                  {getOptionIcon(option.optionValue)}
                  <div className={`font-semibold mt-2 ${index === 0 ? 'text-lg' : 'text-base'}`}>
                    {option.optionText}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {option.voteCount.toLocaleString()} phiếu
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.votePercentage.toFixed(1)}%
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
        title="Bảng Xếp Hạng Phương Án" 
        loading={isLoading}
        extra={
          <Space>
            <Tag color="blue">Tổng: {stats.totalOptions} phương án</Tag>
            <Tag color="green">Tổng: {stats.totalVotes} phiếu</Tag>
          </Space>
        }
      >
        <Table
          columns={rankingColumns}
          dataSource={rankingData}
          pagination={false}
          scroll={{ x: 800 }}
          loading={isLoading}
          locale={{
            emptyText: 'Không có dữ liệu để hiển thị'
          }}
        />
      </Card>

      {/* Quick Stats */}
      {stats.topOption && (
        <Card title="Phương Án Dẫn Đầu" loading={isLoading}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-300">
                <TrophyOutlined className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{stats.topOption.optionText}</h3>
                <p className="text-gray-600">Mã: {stats.topOption.optionCode}</p>
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
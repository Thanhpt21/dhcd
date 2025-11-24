// src/components/admin/verification/VerificationStatistics.tsx
'use client'

import { Card, Row, Col, Statistic, Progress, Table, Tag } from 'antd'
import { useVerificationStatistics } from '@/hooks/verification/useVerificationStatistics'
import type { VerificationStatistics } from '@/types/verification.type'

interface Props {
  meetingId: number
}

export function VerificationStatistics({ meetingId }: Props) {
  const { data: statistics, isLoading } = useVerificationStatistics(meetingId)

  if (!statistics) return null

  const getVerificationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      REGISTRATION: 'blue',
      ATTENDANCE: 'green', 
    }
    return colors[type] || 'default'
  }

  const getVerificationTypeText = (type: string) => {
    const texts: Record<string, string> = {
      REGISTRATION: 'Đăng ký',
      ATTENDANCE: 'Điểm danh',
    }
    return texts[type] || type
  }

  const typeDistributionColumns = [
    {
      title: 'Loại xác thực',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getVerificationTypeColor(type)}>
          {getVerificationTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Tỷ lệ',
      key: 'percentage',
      render: (_: any, record: any) => {
        const percentage = (record.count / statistics.totalLinks * 100).toFixed(1)
        return <Progress percent={parseFloat(percentage)} size="small" />
      },
    },
  ]

  const typeDistributionData = Object.entries(statistics.byVerificationType).map(([type, count]) => ({
    key: type,
    type,
    count,
  }))

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số link"
              value={statistics.totalLinks}
              valueStyle={{ color: '#1890ff' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã sử dụng"
              value={statistics.usedLinks}
              valueStyle={{ color: '#52c41a' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoạt động"
              value={statistics.activeLinks}
              valueStyle={{ color: '#faad14' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={statistics.expiredLinks}
              valueStyle={{ color: '#ff4d4f' }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Tỷ lệ sử dụng" loading={isLoading}>
            <div className="text-center">
              <Progress
                type="circle"
                percent={parseFloat(statistics.usageRate)}
                format={percent => `${percent}%`}
                width={200}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <p className="mt-4 text-gray-600">
                {statistics.usedLinks} / {statistics.totalLinks} link đã được sử dụng
              </p>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Phân bố theo loại" loading={isLoading}>
            <Table
              size="small"
              columns={typeDistributionColumns}
              dataSource={typeDistributionData}
              pagination={false}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Hoạt động gần đây" loading={isLoading}>
        <div className="text-center">
          <Statistic
            title="Lượt xác thực (24h)"
            value={statistics.recentActivity}
            valueStyle={{ color: '#722ed1' }}
          />
        </div>
      </Card>
    </div>
  )
}
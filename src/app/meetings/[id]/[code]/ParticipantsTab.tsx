'use client'

import { List, Tag, Space, Spin, Empty, Typography, Grid } from 'antd'
import { TeamOutlined, UserOutlined } from '@ant-design/icons'
import { useMeetingRegistrations } from '@/hooks/registration/useMeetingRegistrations'
import { RegistrationStatus } from '@/types/registration.type'

const { Text } = Typography
const { useBreakpoint } = Grid

interface ParticipantsTabProps {
  meetingId: number
  shareholderInfo: any
}

export default function ParticipantsTab({ 
  meetingId, 
  shareholderInfo 
}: ParticipantsTabProps) {
  const screens = useBreakpoint()
  const { 
    data: registrations, 
    isLoading: registrationsLoading 
  } = useMeetingRegistrations(meetingId)

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: RegistrationStatus) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
  }

  // Hàm chuyển đổi màu sắc cho trạng thái
  const getStatusColor = (status: RegistrationStatus) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'CANCELLED': 'gray'
    }
    return colorMap[status] || 'default'
  }

  if (registrationsLoading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    )
  }

  if (!registrations || registrations.length === 0) {
    return <Empty description="Chưa có đăng ký tham dự" />
  }

  return (
    <List
      itemLayout={screens.xs ? "vertical" : "horizontal"}
      dataSource={registrations}
      renderItem={(registration: any) => (
        <List.Item>
          <List.Item.Meta
            avatar={<TeamOutlined className="text-purple-500 text-lg md:text-xl" />}
            title={
              <Space direction={screens.xs ? "vertical" : "horizontal"} align={screens.xs ? "start" : "center"} size="small">
                <Text strong className={screens.xs ? 'text-base' : 'text-lg'}>{registration.shareholder?.fullName}</Text>
                <Tag color="blue" className="text-xs">{registration.shareholder?.shareholderCode}</Tag>
                {shareholderInfo && shareholderInfo.id === registration.shareholderId && (
                  <Tag color="green" icon={<UserOutlined />} className="text-xs">Bạn</Tag>
                )}
              </Space>
            }
            description={
              <Space direction="vertical" size="small" className="w-full">
                <Text type="secondary" className="text-sm">
                  Loại: {registration.registrationType} • 
                  Trạng thái: <Tag 
                    color={getStatusColor(registration.status)}
                    className="text-xs"
                  >
                    {getStatusText(registration.status)}
                  </Tag>
                </Text>
                <Text type="secondary" className="text-xs">
                  Cổ phần: {registration.sharesRegistered.toLocaleString()}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )
}
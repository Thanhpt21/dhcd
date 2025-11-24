'use client'

import { List, Tag, Space, Spin, Empty, Typography, Grid } from 'antd'
import { useMeetingAgendas } from '@/hooks/agenda/useMeetingAgendas'
import { AgendaStatus } from '@/types/agenda.type'


const { Text } = Typography
const { useBreakpoint } = Grid

interface AgendasTabProps {
  meetingId: number
}

export default function AgendasTab({ meetingId }: AgendasTabProps) {
  const screens = useBreakpoint()
  const { 
    data: agendas, 
    isLoading: agendasLoading 
  } = useMeetingAgendas(meetingId)

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString('vi-VN')
    } catch (error) {
      return dateString
    }
  }

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: AgendaStatus) => {
    const texts: Record<AgendaStatus, string> = {
      [AgendaStatus.PENDING]: 'Chờ thực hiện',
      [AgendaStatus.ONGOING]: 'Đang diễn ra',
      [AgendaStatus.COMPLETED]: 'Đã hoàn thành',
      [AgendaStatus.CANCELLED]: 'Đã hủy',
      [AgendaStatus.DELAYED]: 'Bị trì hoãn'
    }
    return texts[status]
  }

  // Hàm chuyển đổi màu sắc cho trạng thái
  const getStatusColor = (status: AgendaStatus) => {
    const colorMap: Record<AgendaStatus, string> = {
      [AgendaStatus.PENDING]: 'orange',
      [AgendaStatus.ONGOING]: 'blue',
      [AgendaStatus.COMPLETED]: 'green',
      [AgendaStatus.CANCELLED]: 'red',
      [AgendaStatus.DELAYED]: 'gray'
    }
    return colorMap[status] || 'default'
  }

  if (agendasLoading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    )
  }

  if (!agendas || agendas.length === 0) {
    return <Empty description="Chưa có chương trình nghị sự" />
  }

  return (
    <List
      itemLayout={screens.xs ? "vertical" : "horizontal"}
      dataSource={agendas}
      renderItem={(agenda: any) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <div className={`${screens.xs ? 'w-6 h-6' : 'w-8 h-8'} bg-blue-100 rounded-full flex items-center justify-center`}>
                <Text strong className={screens.xs ? 'text-xs' : 'text-sm'}>{agenda.displayOrder}</Text>
              </div>
            }
            title={
              <Space direction={screens.xs ? "vertical" : "horizontal"} align={screens.xs ? "start" : "center"} size="small">
                <Text strong className={screens.xs ? 'text-base' : 'text-lg'}>{agenda.title}</Text>
                <Tag 
                  color={getStatusColor(agenda.status)} 
                  className="text-xs"
                >
                  {getStatusText(agenda.status)}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size="small" className="w-full">
                {agenda.description && (
                  <Text type="secondary" className="text-sm">{agenda.description}</Text>
                )}
                {agenda.startTime && (
                  <Text type="secondary" className="text-xs">
                    Thời gian: {formatDateTime(agenda.startTime)} 
                    {agenda.endTime && ` - ${formatDateTime(agenda.endTime)}`}
                  </Text>
                )}
                {agenda.speaker && (
                  <Text type="secondary" className="text-xs">Diễn giả: {agenda.speaker}</Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )
}
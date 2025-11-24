// src/components/admin/agenda/AgendaTimeline.tsx
'use client'

import { Card, Timeline, Progress, Tag, Space, Empty } from 'antd'
import { useAgendaTimeline } from '@/hooks/agenda/useAgendaTimeline'
import { useCurrentAgenda } from '@/hooks/agenda/useCurrentAgenda'
import type { Agenda, AgendaStatus } from '@/types/agenda.type'
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface TimelineAgenda extends Agenda {
  progress: number;
}

interface AgendaTimelineData {
  totalItems: number;
  totalDuration: number;
  completedDuration: number;
  completionRate: number;
  items: TimelineAgenda[];
}

interface AgendaTimelineProps {
  meetingId: number
}

export default function AgendaTimeline({ meetingId }: AgendaTimelineProps) {
  const { data: timeline, isLoading } = useAgendaTimeline(meetingId)
  const { data: currentAgenda } = useCurrentAgenda(meetingId)

  const getStatusColor = (status: AgendaStatus) => {
    const colors: Record<AgendaStatus, string> = {
      PENDING: 'gray',
      ONGOING: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red',
      DELAYED: 'orange'
    }
    return colors[status] || 'gray'
  }

  const getStatusIcon = (status: AgendaStatus) => {
    const icons: Record<AgendaStatus, React.ReactElement> = {
      PENDING: <ClockCircleOutlined />,
      ONGOING: <PlayCircleOutlined />,
      COMPLETED: <CheckCircleOutlined />,
      CANCELLED: <ClockCircleOutlined />,
      DELAYED: <ClockCircleOutlined />
    }
    return icons[status]
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // SẮP XẾP ITEMS THEO DISPLAYORDER TĂNG DẦN
  const sortedItems = timeline?.items ? 
    [...timeline.items].sort((a, b) => a.displayOrder - b.displayOrder) : 
    [];

  if (isLoading) {
    return <Card loading={isLoading} />
  }

  if (!timeline || timeline.items.length === 0) {
    return (
      <Card title="Timeline Chương trình Nghị sự">
        <Empty description="Chưa có chương trình nghị sự nào" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card title="Tổng quan Tiến độ">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Tiến độ tổng thể</span>
            <span className="font-semibold">{timeline.completionRate}%</span>
          </div>
          <Progress 
            percent={parseFloat(timeline.completionRate)} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{timeline.totalItems}</div>
              <div className="text-gray-600">Tổng mục</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(timeline.completedDuration)}/{timeline.totalDuration}
              </div>
              <div className="text-gray-600">Phút đã hoàn thành</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {timeline.completionRate}%
              </div>
              <div className="text-gray-600">Tỷ lệ hoàn thành</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Agenda */}
      {currentAgenda && (
        <Card 
          title={
            <Space>
              {currentAgenda.isCurrent ? 'Chương trình Hiện tại' : 'Chương trình Tiếp theo'}
              <Tag color={currentAgenda.isCurrent ? 'blue' : 'orange'}>
                {currentAgenda.isCurrent ? 'ĐANG DIỄN RA' : 'TIẾP THEO'}
              </Tag>
            </Space>
          }
        >
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">{currentAgenda.title}</h3>
            <div className="space-y-2 text-sm">
              {currentAgenda.speaker && (
                <div>
                  <span className="font-semibold">Diễn giả:</span> {currentAgenda.speaker}
                </div>
              )}
              {currentAgenda.startTime && currentAgenda.endTime && (
                <div>
                  <span className="font-semibold">Thời gian:</span>{' '}
                  {formatTime(currentAgenda.startTime)} - {formatTime(currentAgenda.endTime)}
                </div>
              )}
              {currentAgenda.duration && (
                <div>
                  <span className="font-semibold">Thời lượng:</span> {currentAgenda.duration} phút
                </div>
              )}
              <div>
                <span className="font-semibold">Thứ tự:</span> {currentAgenda.displayOrder}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline - SỬ DỤNG sortedItems ĐÃ SẮP XẾP */}
      <Card title="Dòng thời gian Chương trình Nghị sự">
        <Timeline>
          {sortedItems.map((agenda: TimelineAgenda) => (
            <Timeline.Item
              key={agenda.id}
              color={getStatusColor(agenda.status)}
              dot={getStatusIcon(agenda.status)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center">
                      {agenda.displayOrder}
                    </span>
                    <h4 className="font-semibold text-base">{agenda.title}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 ml-8">
                    {agenda.speaker && (
                      <div>Diễn giả: {agenda.speaker}</div>
                    )}
                    {agenda.startTime && agenda.endTime && (
                      <div>
                        Thời gian: {formatTime(agenda.startTime)} - {formatTime(agenda.endTime)}
                      </div>
                    )}
                    {agenda.duration && (
                      <div>Thời lượng: {agenda.duration} phút</div>
                    )}
                    {agenda.description && (
                      <div className="mt-1">
                        {agenda.description.length > 100 
                          ? `${agenda.description.substring(0, 100)}...` 
                          : agenda.description
                        }
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <Tag color={getStatusColor(agenda.status)}>
                    {agenda.status === 'PENDING' && 'Chờ thực hiện'}
                    {agenda.status === 'ONGOING' && 'Đang diễn ra'}
                    {agenda.status === 'COMPLETED' && 'Đã hoàn thành'}
                    {agenda.status === 'CANCELLED' && 'Đã hủy'}
                    {agenda.status === 'DELAYED' && 'Bị trì hoãn'}
                  </Tag>
                  {agenda.progress > 0 && (
                    <Progress 
                      percent={agenda.progress} 
                      size="small" 
                      style={{ width: 80, marginTop: 8 }}
                    />
                  )}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  )
}
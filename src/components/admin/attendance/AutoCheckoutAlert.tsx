// src/components/admin/attendance/AutoCheckoutAlert.tsx
'use client'

import { Alert, List, Tag, Button, Space } from 'antd'
import { useAutoCheckoutStatus } from '@/hooks/attendance/useAutoCheckoutStatus'
import { useRunAutoCheckout } from '@/hooks/attendance/useRunAutoCheckout'
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

interface AutoCheckoutAlertProps {
  meetingId: number
}

export const AutoCheckoutAlert = ({ meetingId }: AutoCheckoutAlertProps) => {
  const { data: status, isLoading } = useAutoCheckoutStatus(meetingId)
  const { mutateAsync: runAutoCheckout, isPending } = useRunAutoCheckout()

  if (isLoading || !status) return null

  const { expiringCount, expiredCount, expiringAttendances, expiredAttendances, meetingDuration } = status

  const handleRunAutoCheckout = async () => {
    try {
      await runAutoCheckout(meetingId)
    } catch (error) {
      console.error('Lỗi chạy tự động checkout:', error)
    }
  }

  if (expiredCount === 0 && expiringCount === 0) {
    return null
  }

  return (
    <div className="mb-4 space-y-3">
      {/* Cảnh báo người đã hết thời gian */}
      {expiredCount > 0 && (
        <Alert
          message={
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <span>
                  <ExclamationCircleOutlined /> {expiredCount} người tham dự đã vượt quá thời lượng ({meetingDuration} phút)
                </span>
                <Button 
                  type="primary" 
                  size="small" 
                  loading={isPending}
                  onClick={handleRunAutoCheckout}
                >
                  Tự động checkout ngay
                </Button>
              </div>
              <List
                size="small"
                dataSource={expiredAttendances}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <span>{item.shareholderName}</span>
                      <Tag color="red">Quá {item.timeExceeded} phút</Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Space>
          }
          type="warning"
          showIcon
          closable
        />
      )}

      {/* Cảnh báo người sắp hết thời gian */}
      {expiringCount > 0 && (
        <Alert
          message={
            <Space direction="vertical" className="w-full">
              <div>
                <ClockCircleOutlined /> {expiringCount} người tham dự sắp hết thời lượng
              </div>
              <List
                size="small"
                dataSource={expiringAttendances}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <span>{item.shareholderName}</span>
                      <Tag color="orange">Còn {item.timeRemaining} phút</Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Space>
          }
          type="info"
          showIcon
          closable
        />
      )}
    </div>
  )
}
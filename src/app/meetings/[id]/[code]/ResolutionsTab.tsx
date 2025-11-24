'use client'

import { List, Button, Tag, Space, Spin, Empty, Typography, Modal, Grid } from 'antd'
import { BarChartOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useMeetingResolutions } from '@/hooks/resolution/useMeetingResolutions'
import { useShareholderVoteMap } from '@/hooks/vote/useShareholderVoteMap'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface ResolutionsTabProps {
  meetingId: number
  verificationCode: string
  shareholderInfo: any
  attendanceVerified: boolean
  verificationResponse: any
  onVoteClick: (resolution: any) => void
}

export default function ResolutionsTab({
  meetingId,
  verificationCode,
  shareholderInfo,
  attendanceVerified,
  verificationResponse,
  onVoteClick
}: ResolutionsTabProps) {
  const screens = useBreakpoint()
  const { 
    data: resolutions, 
    isLoading: resolutionsLoading 
  } = useMeetingResolutions(meetingId)

  const { data: voteMap } = useShareholderVoteMap(shareholderInfo?.id)

  const handleVoteClick = (resolution: any) => {
    if (!verificationCode) {
      Modal.warning({
        title: 'Không thể bỏ phiếu',
        content: 'Không tìm thấy thông tin xác thực. Vui lòng điểm danh lại.',
      })
      return
    }

    if (!attendanceVerified && !verificationResponse?.data?.isUsed) {
      Modal.warning({
        title: 'Chưa điểm danh',
        content: 'Vui lòng điểm danh trước khi bỏ phiếu.',
      })
      return
    }

    onVoteClick(resolution)
  }

  if (resolutionsLoading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    )
  }

  if (!resolutions || resolutions.length === 0) {
    return <Empty description="Chưa có nghị quyết nào" />
  }

  return (
    <List
      itemLayout={screens.xs ? "vertical" : "horizontal"}
      dataSource={resolutions}
      renderItem={(resolution: any) => (
        <List.Item
          actions={[
            voteMap?.[resolution.id] ? (
              <Tag 
                color="green" 
                icon={<CheckCircleOutlined />}
                className="text-xs md:text-sm"
              >
                Đã bỏ phiếu
              </Tag>
            ) : (
              <Button 
                key="vote" 
                type="primary"
                disabled={!resolution.isActive}
                onClick={() => handleVoteClick(resolution)}
                size={screens.xs ? "small" : "middle"}
                block={screens.xs}
              >
                {resolution.isActive ? 'Bỏ Phiếu' : 'Đã Kết Thúc'}
              </Button>
            )
          ]}
        >
          <List.Item.Meta
            avatar={
              <BarChartOutlined className={`${screens.xs ? 'text-lg' : 'text-xl'} text-green-500`} />
            }
            title={
              <Space direction="vertical" size="small" className="w-full">
                <Text strong className={screens.xs ? 'text-base' : 'text-lg'}>
                  {resolution.title}
                </Text>
                <Space 
                  wrap 
                  size={[4, 8]} 
                  className={`${screens.xs ? 'w-full' : ''}`}
                >
                  <Tag 
                    color={resolution.isActive ? 'green' : 'default'}
                    className="text-xs"
                  >
                    {resolution.isActive ? 'ĐANG BỎ PHIẾU' : 'ĐÃ KẾT THÚC'}
                  </Tag>
                  <Tag color="blue" className="text-xs">
                    {resolution.votingMethod}
                  </Tag>
                  <Tag color="orange" className="text-xs">
                    Ngưỡng: {resolution.approvalThreshold}%
                  </Tag>
                </Space>
              </Space>
            }
            description={
              <Space direction="vertical" size="small" className="w-full">
                <Paragraph 
                  className="!mb-2 text-sm md:text-base" 
                  ellipsis={{ 
                    rows: screens.xs ? 3 : 2,
                    tooltip: resolution.content 
                  }}
                >
                  {resolution.content}
                </Paragraph>
                <Text type="secondary" className="text-xs md:text-sm">
                  Mã: {resolution.resolutionCode} • Tổng phiếu: {resolution.totalVotes}
                </Text>
                {resolution.candidates && resolution.candidates.length > 0 && (
                  <div className="mt-2">
                    <Text strong className="text-sm">Ứng cử viên: </Text>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {resolution.candidates.map((candidate: any) => (
                        <Tag 
                          key={candidate.id} 
                          color="cyan" 
                          className="text-xs m-0"
                        >
                          {candidate.candidateName}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )
}
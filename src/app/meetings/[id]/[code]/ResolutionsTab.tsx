'use client'

import { List, Button, Tag, Space, Spin, Empty, Typography, Modal, Grid, Alert } from 'antd'
import { BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
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
  meetingData: any // ✅ THÊM prop meetingData
}

export default function ResolutionsTab({
  meetingId,
  verificationCode,
  shareholderInfo,
  attendanceVerified,
  verificationResponse,
  onVoteClick,
  meetingData // ✅ NHẬN meetingData từ page
}: ResolutionsTabProps) {
  const screens = useBreakpoint()
  const { 
    data: resolutions, 
    isLoading: resolutionsLoading 
  } = useMeetingResolutions(meetingId)

  const { data: voteMap } = useShareholderVoteMap(shareholderInfo?.id)

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Chưa có thông tin'
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  // ✅ KIỂM TRA THỜI GIAN BỎ PHIẾU
  const isVotingTime = () => {
    if (!meetingData) return false
    
    const now = new Date()
    const votingStart = meetingData.votingStart ? new Date(meetingData.votingStart) : null
    const votingEnd = meetingData.votingEnd ? new Date(meetingData.votingEnd) : null
    
    if (votingStart && votingEnd) {
      return now >= votingStart && now <= votingEnd
    }
    
    return false
  }

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

    // ✅ KIỂM TRA THỜI GIAN BỎ PHIẾU
    if (!isVotingTime()) {
      Modal.warning({
        title: 'Ngoài thời gian bỏ phiếu',
        content: `Thời gian bỏ phiếu: ${formatDateTime(meetingData?.votingStart)} - ${formatDateTime(meetingData?.votingEnd)}`,
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
    <div className="space-y-4">
      {/* ✅ HIỂN THỊ THÔNG BÁO THỜI GIAN BỎ PHIẾU */}
      {meetingData && (meetingData.votingStart || meetingData.votingEnd) && (
        <Alert
          message="Thời gian bỏ phiếu"
          description={
            <Space direction="vertical" size="small">
              <div>
                <Text strong>Bắt đầu: </Text>
                <Text>{formatDateTime(meetingData.votingStart)}</Text>
              </div>
              <div>
                <Text strong>Kết thúc: </Text>
                <Text>{formatDateTime(meetingData.votingEnd)}</Text>
              </div>
              {!isVotingTime() && (
                <Text type="warning" className="text-sm">
                  ⚠️ Hiện tại ngoài thời gian bỏ phiếu
                </Text>
              )}
            </Space>
          }
          type={isVotingTime() ? "info" : "warning"}
          showIcon
          icon={<ClockCircleOutlined />}
        />
      )}

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
                  // ✅ DISABLE NẾU NGOÀI THỜI GIAN BỎ PHIẾU
                  disabled={!resolution.isActive || !isVotingTime()}
                  onClick={() => handleVoteClick(resolution)}
                  size={screens.xs ? "small" : "middle"}
                  block={screens.xs}
                >
                  {!isVotingTime() ? 'Ngoài giờ bỏ phiếu' : 
                   resolution.isActive ? 'Bỏ Phiếu' : 'Đã Kết Thúc'}
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
                    {/* ✅ HIỂN THỊ TRẠNG THÁI THỜI GIAN */}
                    {!isVotingTime() && (
                      <Tag color="red" className="text-xs">
                        NGOÀI GIỜ BỎ PHIẾU
                      </Tag>
                    )}
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
    </div>
  )
}
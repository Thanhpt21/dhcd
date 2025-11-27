'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tabs, 
  Button, 
  Space,
  Descriptions,
  Alert,
  Spin,
  Empty,
  Skeleton,
  message,
  Modal,
  Badge,
  Result,
  Tag,
  Grid
} from 'antd'
import { 
  FileTextOutlined, 
  ScheduleOutlined, 
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  MenuOutlined
} from '@ant-design/icons'

// Import components
import {
  SelectedQuestionsTab,
  AgendasTab,
  DocumentsTab,
  ResolutionsTab,
  ParticipantsTab
} from './index'

// Import hooks
import { useVerificationLinkByCode } from '@/hooks/verification/useVerificationLinkByCode'
import { useMeetingOne } from '@/hooks/meeting/useMeetingOne'
import VoteModal from '@/components/layout/voting/VoteModal'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { useBreakpoint } = Grid

export default function MeetingDetailWithVerificationPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = Number(params.id)
  const verificationCode = params.code as string
  const screens = useBreakpoint()

  const [isClient, setIsClient] = useState(false)
  const [meetingLink] = useState("https://meet.google.com/fut-vigc-ari")
  const [shareholderInfo, setShareholderInfo] = useState<any>(null)
  const [attendanceVerified, setAttendanceVerified] = useState(false)
  const [verificationChecked, setVerificationChecked] = useState(false)
  
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [selectedResolutionId, setSelectedResolutionId] = useState<any>(null)

  // Sử dụng hook meeting
  const { 
    data: meeting, 
    isLoading: meetingLoading,
    error: meetingError 
  } = useMeetingOne(meetingId)

  // Sử dụng hook verification để kiểm tra mã xác thực
  const { 
    data: verificationResponse, 
    isLoading: verificationLoading,
    error: verificationError 
  } = useVerificationLinkByCode(verificationCode)

  // Set client state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Xử lý verification data
  useEffect(() => {
    if (verificationResponse) {
      if (verificationResponse?.success && verificationResponse.data) {
        const verificationData = verificationResponse.data
        
        console.log('🔍 Verification Data:', verificationData)
        
        if (verificationData.meetingId !== meetingId) {
          message.error('Mã xác thực không thuộc cuộc họp này')
          router.push('/')
          return
        }

        if (verificationData.isUsed) {
          setAttendanceVerified(true)
          message.success('Đã điểm danh thành công trước đó')
        }

        if (verificationData.shareholder) {
          setShareholderInfo(verificationData.shareholder)
          
          localStorage.setItem('lastAttendance', JSON.stringify({
            verificationCode,
            shareholderId: verificationData.shareholder.id,
            meetingId,
            timestamp: new Date().toISOString()
          }))
        }
      }
      setVerificationChecked(true)
    }
  }, [verificationResponse, meetingId, verificationCode, router])

  const handleVoteClick = (resolution: any) => {
    setSelectedResolutionId(resolution.id)
    setVoteModalOpen(true)
  }

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ONGOING': 'green',
      'UPCOMING': 'blue',
      'COMPLETED': 'gray',
      'CANCELLED': 'red'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'Đã lên lịch',
      'ONGOING': 'Đang diễn ra',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy',
      'UPCOMING': 'Sắp diễn ra'
    }
    return statusMap[status] || status
  }

  const getMeetingTypeText = (type: string) => {
    const types: Record<string, string> = {
      'AGM': 'Đại hội đồng cổ đông thường niên',
      'EGM': 'Đại hội đồng cổ đông bất thường',
      'BOARD': 'Họp hội đồng quản trị',
      'SHAREHOLDER': 'Họp cổ đông',
      'ANNUAL_GENERAL': 'Đại hội thường niên'
    }
    return types[type] || type
  }

  // Hiển thị loading khi đang kiểm tra verification
  if (!verificationChecked || verificationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-4">
            <div className="text-center py-8">
              <Spin size="large" />
              <div className="mt-4">Đang kiểm tra mã xác thực...</div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Kiểm tra lỗi verification
  if (verificationError || !verificationResponse?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3">
        <div className="max-w-7xl mx-auto">
          <Card>
            <Result
              status="error"
              title="Mã xác thực không hợp lệ"
              subTitle="Mã xác thực không tồn tại hoặc đã hết hạn"
              extra={[
                <Button type="primary" key="home" href="/">
                  Về Trang Chủ
                </Button>,
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-4">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-7xl mx-auto">
        {/* Header với thông tin cổ đông */}
        <Card className="mb-4 shadow-sm">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size="small" className="w-full">
                {meetingLoading ? (
                  <Skeleton.Input active size="large" style={{ width: '100%', maxWidth: 300 }} />
                ) : (
                  <Title 
                    level={screens.xs ? 2 : 1} 
                    className="!mb-0 !text-blue-600 break-words"
                  >
                    {meeting?.meetingName || 'Cuộc họp'}
                  </Title>
                )}
                <Text type="secondary" className="text-base md:text-lg">
                  {meetingLoading ? <Skeleton.Input active size="small" style={{ width: 150 }} /> : meeting?.meetingCode}
                </Text>
                <Space wrap size={[4, 8]} className="w-full">
                  {meetingLoading ? (
                    <Skeleton.Button active size="small" />
                  ) : (
                   <Tag color={getStatusColor(meeting?.status || 'ONGOING')} className="text-xs md:text-sm">
                      {getStatusText(meeting?.status || 'ONGOING')}
                    </Tag>
                  )}
                  {meetingLoading ? (
                    <Skeleton.Button active size="small" />
                  ) : (
                    <Tag color="blue" icon={<CalendarOutlined />} className="text-xs md:text-sm">
                      {meeting?.meetingDate ? formatDateTime(meeting.meetingDate) : 'Đang tải...'}
                    </Tag>
                  )}
                  {meetingLoading ? (
                    <Skeleton.Button active size="small" />
                  ) : (
                    <Tag color="orange" icon={<EnvironmentOutlined />} className="text-xs md:text-sm">
                      {meeting?.meetingLocation || 'Đang tải...'}
                    </Tag>
                  )}
                  {shareholderInfo && (
                    <Badge count="Đã xác thực" showZero={false}>
                      <Tag color="green" icon={<UserOutlined />} className="text-xs md:text-sm">
                        <span className="hidden xs:inline">
                          {shareholderInfo.fullName} ({shareholderInfo.shareholderCode})
                        </span>
                        <span className="xs:hidden">
                          {shareholderInfo.fullName}
                        </span>
                      </Tag>
                    </Badge>
                  )}
                </Space>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <div className="flex justify-end">
                <Button 
                  type="primary" 
                  size={screens.xs ? "middle" : "large"}
                  icon={<VideoCameraOutlined />}
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  loading={meetingLoading}
                  block={screens.xs}
                >
                  Tham Gia Google Meet
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Thông báo điểm danh */}
        {verificationResponse?.data?.isUsed && (
          <Alert
            message="Đã điểm danh thành công"
            description={`Bạn đã điểm danh tham dự vào cuộc họp`}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-4"
          />
        )}

        {/* Meeting Info */}
        <Row gutter={[12, 12]} className="mb-4">
          <Col span={24}>
            <Card 
              title={
                meetingLoading ? (
                  <Skeleton.Input active size="small" style={{ width: 200 }} />
                ) : (
                  "Thông Tin Cuộc Họp"
                )
              }
            >
              {meetingLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : meeting ? (
                <>
                  <Descriptions 
                    column={{ xs: 1, sm: 1, md: 2, lg: 3 }} 
                    bordered
                    size="small"
                  >
                    <Descriptions.Item label="Loại cuộc họp" span={1}>
                      {getMeetingTypeText(meeting.meetingType)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa điểm" span={1}>
                      {meeting.meetingAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng số cổ phần" span={1}>
                      {meeting.totalShares.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian bỏ phiếu" span={1}>
                      {formatDateTime(meeting.votingStart)} - {formatDateTime(meeting.votingEnd)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng số cổ đông" span={1}>
                      {meeting.totalShareholders}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo" span={1}>
                      {meeting.createdByUser.name}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  {meeting.description && (
                    <div className="mt-4">
                      <Text strong>Mô tả: </Text>
                      <Paragraph className="!mb-0 text-sm md:text-base">
                        {meeting.description}
                      </Paragraph>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không tìm thấy thông tin cuộc họp" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card className="overflow-hidden">
          <Tabs 
            defaultActiveKey="questions" 
            size={screens.xs ? "small" : "large"}
            type={screens.xs ? "line" : "card"}
            tabPosition={screens.xs ? "top" : "top"}
            items={[
              {
                key: 'questions',
                label: (
                  <span className="flex items-center">
                    <QuestionCircleOutlined className="text-sm md:text-base" />
                    <span className="ml-1 text-xs md:text-sm">Câu Hỏi</span>
                  </span>
                ),
                children: (
                  <SelectedQuestionsTab
                    meetingId={meetingId}
                    verificationCode={verificationCode}
                    shareholderInfo={shareholderInfo}
                  />
                )
              },
              ...(meeting ? [
                {
                  key: 'agendas',
                  label: (
                    <span className="flex items-center">
                      <ScheduleOutlined className="text-sm md:text-base" />
                      <span className="ml-1 text-xs md:text-sm">CT Nghị Sự</span>
                    </span>
                  ),
                  children: <AgendasTab meetingId={meetingId} />
                },
                {
                  key: 'documents',
                  label: (
                    <span className="flex items-center">
                      <FileTextOutlined className="text-sm md:text-base" />
                      <span className="ml-1 text-xs md:text-sm">Tài Liệu</span>
                    </span>
                  ),
                  children: <DocumentsTab meetingId={meetingId} />
                },
                {
                  key: 'resolutions',
                  label: (
                    <span className="flex items-center">
                      <BarChartOutlined className="text-sm md:text-base" />
                      <span className="ml-1 text-xs md:text-sm">Nghị Quyết</span>
                    </span>
                  ),
                  children: (
                    <ResolutionsTab
                      meetingId={meetingId}
                      verificationCode={verificationCode}
                      shareholderInfo={shareholderInfo}
                      attendanceVerified={attendanceVerified}
                      verificationResponse={verificationResponse}
                      onVoteClick={handleVoteClick}
                      meetingData={meeting}
                    />
                  )
                },
                {
                  key: 'participants',
                  label: (
                    <span className="flex items-center">
                      <TeamOutlined className="text-sm md:text-base" />
                      <span className="ml-1 text-xs md:text-sm">Tham Dự</span>
                    </span>
                  ),
                  children: (
                    <ParticipantsTab
                      meetingId={meetingId}
                      shareholderInfo={shareholderInfo}
                    />
                  )
                }
              ] : [])
            ]}
          />
        </Card>

        {/* Voting Alert */}
        {meeting?.status === 'ONGOING' && (
          <Alert
            message="Cuộc họp đang diễn ra"
            description="Quý cổ đông có thể tham gia bỏ phiếu cho các nghị quyết trong tab 'Nghị Quyết'"
            type="info"
            showIcon
            className="mt-4"
          />
        )}

        <VoteModal
          open={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          verificationCode={verificationCode}
          meetingId={meetingId}
          shareholderInfo={shareholderInfo}
          selectedResolutionId={selectedResolutionId}
        />
      </div>
    </div>
  )
}
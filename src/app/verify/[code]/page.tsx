// src/app/verify/[code]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, Result, Button, Spin, Descriptions, Tag, Space, Alert, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import { useVerifyLink } from '@/hooks/verification/useVerifyLink'
import { useVerificationLinkByCode } from '@/hooks/verification/useVerificationLinkByCode'
import type { VerificationLink } from '@/types/verification.type'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export default function VerifyPage() {
  const params = useParams()
  const verificationCode = params.code as string
  
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasAutoVerified, setHasAutoVerified] = useState(false)
  
  const { data: linkResponse, isLoading, error: linkError } = useVerificationLinkByCode(verificationCode)
  const { mutateAsync: verifyLink } = useVerifyLink()

  // Extract data từ response
  const verificationLink = linkResponse?.data

  console.log('🔍 Debug Verification:', {
    verificationCode,
    linkResponse,
    verificationLink,
    verificationResult,
    hasAutoVerified,
    isVerifying
  })

  useEffect(() => {
    if (verificationLink && !verificationLink.isUsed && !verificationResult && !hasAutoVerified) {
      console.log('🔄 Auto-verifying link...')
      setHasAutoVerified(true)
      handleVerify()
    }
  }, [verificationLink, verificationResult, hasAutoVerified])

  const handleVerify = async () => {
    if (!verificationLink) return
    
    setIsVerifying(true)
    try {
      console.log('🚀 Starting verification...')
      const ipAddress = await getClientIP()
      
      const result = await verifyLink({
        verificationCode,
        ipAddress,
        userAgent: navigator.userAgent,
      })
      
      console.log('✅ Verification success - FULL RESPONSE:', result)
      setVerificationResult(result)
    } catch (error: any) {
      console.error('❌ Verification failed:', error)
      
      setVerificationResult({
        success: false,
        message: error?.response?.data?.message || error?.message || 'Xác thực thất bại',
        error: error
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'unknown'
    }
  }

  const getStatusInfo = (link: VerificationLink) => {
    if (link.isUsed) {
      return { color: 'green', text: 'Đã sử dụng', icon: <CheckCircleOutlined /> }
    }
    if (dayjs().isAfter(dayjs(link.expiresAt))) {
      return { color: 'red', text: 'Đã hết hạn', icon: <CloseCircleOutlined /> }
    }
    return { color: 'blue', text: 'Hoạt động', icon: <LoadingOutlined /> }
  }

  // Hàm kiểm tra xác thực thành công
  const isVerificationSuccessful = (result: any): boolean => {
    if (!result) return false
    return result.success === true && result.data?.verification && result.data?.meeting
  }

  // Lấy data từ kết quả verify
  const getVerificationData = (result: any) => {
    if (!result) return null
    return result.data
  }

  // Hiển thị loading
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <Spin size="large" className="mb-4" />
          <Title level={3} className="text-gray-700">
            {isVerifying ? "Đang xác thực..." : "Đang tải thông tin xác thực..."}
          </Title>
          <Text type="secondary">
            Vui lòng đợi trong giây lát...
          </Text>
        </Card>
      </div>
    )
  }

  // Kiểm tra lỗi khi fetch verification link
  if (linkError || !linkResponse?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="error"
            title="Không tìm thấy link xác thực"
            subTitle="Link xác thực không tồn tại hoặc đã bị thu hồi"
          />
          
          <div className="text-center mt-6">
            <Alert
              message="Thông báo quan trọng"
              description={
                <div>
                  <p>Vui lòng đợi đến khi cuộc họp diễn ra, quản trị viên sẽ gửi link tham dự mới.</p>
                  <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với ban tổ chức.</p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        </Card>
      </div>
    )
  }

  if (!verificationLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="error"
            title="Link không tồn tại"
            subTitle="Mã xác thực không hợp lệ hoặc đã bị xóa"
          />
          
          <div className="text-center mt-6">
            <Alert
              message="Vui lòng đợi link tham dự mới"
              description="Quản trị viên sẽ gửi link tham dự khi cuộc họp sẵn sàng diễn ra."
              type="info"
              showIcon
            />
          </div>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(verificationLink)

  // HIỂN THỊ KẾT QUẢ XÁC THỰC THÀNH CÔNG
  if (verificationResult && isVerificationSuccessful(verificationResult)) {
    const resultData = getVerificationData(verificationResult)
    
    console.log('🎉 Showing success screen with result data:', resultData)

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="success"
            title="Xác thực thành công!"
            subTitle="Bạn đã xác thực tham dự cuộc họp thành công"
            icon={<CheckCircleOutlined className="text-green-500" />}
          />

          <Descriptions title="Thông tin xác thực" bordered column={1} className="mt-6">
            <Descriptions.Item label="Cổ đông">
              <strong>{resultData?.shareholder?.fullName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã cổ đông">
              {resultData?.shareholder?.shareholderCode}
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {resultData?.meeting?.meetingName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian xác thực">
              {dayjs().format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>

          <Alert
            message="Xác thực hoàn tất"
            description="Bạn có thể đóng trang này. Quá trình xác thực đã được ghi nhận thành công."
            type="success"
            showIcon
            className="mt-6"
          />
        </Card>
      </div>
    )
  }

  // HIỂN THỊ LỖI XÁC THỰC
  if (verificationResult && !isVerificationSuccessful(verificationResult)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="error"
            title="Xác thực thất bại"
            subTitle={verificationResult.message || "Không thể hoàn tất xác thực lúc này"}
            icon={<CloseCircleOutlined className="text-red-500" />}
          />

          <div className="text-center mt-6">
            <Alert
              message="Vui lòng đợi hướng dẫn mới"
              description={
                <div>
                  <p>Quản trị viên sẽ gửi hướng dẫn mới khi cuộc họp sẵn sàng.</p>
                  <p>Vui lòng không tự ý làm mới trang.</p>
                </div>
              }
              type="warning"
              showIcon
            />
          </div>
        </Card>
      </div>
    )
  }

  // Link đã được sử dụng trước đó
  if (verificationLink.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="success"
            title="Đã xác thực thành công"
            subTitle="Link này đã được sử dụng trước đó"
            icon={<CheckCircleOutlined className="text-green-500" />}
          />
          
          <Descriptions title="Thông tin xác thực" bordered column={1} className="mt-6">
            <Descriptions.Item label="Mã xác thực">
              <strong>{verificationLink.verificationCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cổ đông">
              {verificationLink.shareholder?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {verificationLink.meeting?.meetingName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sử dụng">
              {verificationLink.usedAt ? dayjs(verificationLink.usedAt).format('DD/MM/YYYY HH:mm') : '—'}
            </Descriptions.Item>
          </Descriptions>

          <Alert
            message="Xác thực đã hoàn tất"
            description="Bạn không cần thực hiện thêm hành động nào. Quá trình xác thực đã được ghi nhận."
            type="info"
            showIcon
            className="mt-6"
          />
        </Card>
      </div>
    )
  }

  // Link đã hết hạn
  if (dayjs().isAfter(dayjs(verificationLink.expiresAt))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="warning"
            title="Link đã hết hạn"
            subTitle="Link xác thực này đã hết thời gian sử dụng"
            icon={<ClockCircleOutlined className="text-orange-500" />}
          />
          
          <div className="text-center mt-6">
            <Alert
              message="Vui lòng đợi link tham dự mới"
              description={
                <div>
                  <p>Quản trị viên sẽ gửi link tham dự mới khi cuộc họp diễn ra.</p>
                  <p>Thời hạn của link này đã kết thúc vào: <strong>{dayjs(verificationLink.expiresAt).format('DD/MM/YYYY HH:mm')}</strong></p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        </Card>
      </div>
    )
  }

  // HIỂN THỊ THÔNG BÁO CHỜ CUỘC HỌP DIỄN RA (thay vì form xác thực)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff' }} className="mb-4" />
          <Title level={2} className="text-gray-800 mb-2">Link Tham Dự Cuộc Họp</Title>
          <Text type="secondary" className="text-lg">
            Đã nhận thông tin xác thực của bạn
          </Text>
        </div>

        <Alert
          message="Vui lòng chờ đến khi cuộc họp diễn ra"
          description="Quản trị viên sẽ gửi link tham dự chính thức khi cuộc họp bắt đầu. Bạn không cần thực hiện thêm hành động nào tại thời điểm này."
          type="info"
          showIcon
          className="mb-6"
        />

        <Descriptions title="Thông tin đã nhận" bordered column={1}>
          <Descriptions.Item label="Mã xác thực">
            <strong>{verificationLink.verificationCode}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
              {statusInfo.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Cổ đông">
            <strong>{verificationLink.shareholder?.fullName}</strong>
            <br />
            <span className="text-gray-500">Mã: {verificationLink.shareholder?.shareholderCode}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Cuộc họp">
            <strong>{verificationLink.meeting?.meetingName}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Thời hạn link">
            {dayjs(verificationLink.expiresAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} className="mb-2" />
          <Paragraph strong className="text-gray-700 mb-2">
            Đang chờ cuộc họp diễn ra
          </Paragraph>
          <Paragraph type="secondary" className="text-sm">
            Quản trị viên sẽ thông báo khi cuộc họp sẵn sàng. Vui lòng giữ liên lạc.
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}
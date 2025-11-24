// src/app/verify/[code]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, Result, Button, Spin, Descriptions, Tag, Space, Alert } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useVerifyLink } from '@/hooks/verification/useVerifyLink'
import { useVerificationLinkByCode } from '@/hooks/verification/useVerificationLinkByCode'
import type { VerificationLink } from '@/types/verification.type'
import dayjs from 'dayjs'

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
    linkResponse, // Toàn bộ response từ GET /code/:code
    verificationLink, // Data thực tế
    verificationResult, // Response từ POST /verify
    hasAutoVerified,
    isVerifying
  })

  useEffect(() => {
    // Chỉ auto verify khi chưa verify và link hợp lệ
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

  const getRedirectUrl = (verificationType: string): string => {
    const redirectUrls: Record<string, string> = {
      REGISTRATION: '/registration/complete',
      ATTENDANCE: '/attendance/success', 
    }
    
    return redirectUrls[verificationType] || '/verify/success'
  }

  // Hàm kiểm tra xác thực thành công - DỰA TRÊN CẤU TRÚC RESPONSE THỰC TẾ
  const isVerificationSuccessful = (result: any): boolean => {
    if (!result) return false
    
    // API verify trả về: { success: true, message: string, data: { verification, meeting, shareholder, redirectUrl } }
    return result.success === true && result.data?.verification && result.data?.meeting
  }

  // Lấy data từ kết quả verify
  const getVerificationData = (result: any) => {
    if (!result) return null
    return result.data // Trả về data từ wrapper
  }

  // Hiển thị loading
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip={isVerifying ? "Đang xác thực..." : "Đang tải thông tin xác thực..."} />
      </div>
    )
  }

  // Kiểm tra lỗi khi fetch verification link
  if (linkError || !linkResponse?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Result
          status="error"
          title="Lỗi tải thông tin"
          subTitle={linkError?.message || linkResponse?.message || "Không thể tải thông tin xác thực"}
          extra={[
            <Button type="primary" key="home" href="/">
              Về trang chủ
            </Button>,
            <Button key="retry" onClick={() => window.location.reload()}>
              Thử lại
            </Button>,
          ]}
        />
      </div>
    )
  }

  if (!verificationLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Result
          status="error"
          title="Link không tồn tại"
          subTitle="Mã xác thực không hợp lệ hoặc đã bị xóa"
          extra={[
            <Button type="primary" key="home" href="/">
              Về trang chủ
            </Button>,
          ]}
        />
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
            subTitle={verificationResult.message || "Bạn đã xác thực tham dự cuộc họp thành công"}
            extra={[
              <Button key="home" href="/">
                Về trang chủ
              </Button>,
            ]}
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
            <Descriptions.Item label="Loại xác thực">
              <Tag color="blue">{verificationLink.verificationType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian xác thực">
              {dayjs().format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Mã xác thực">
              <code>{verificationLink.verificationCode}</code>
            </Descriptions.Item>
          </Descriptions>
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
            subTitle={verificationResult.message || "Đã có lỗi xảy ra trong quá trình xác thực"}
            extra={[
              <Button type="primary" key="home" href="/">
                Về trang chủ
              </Button>,
              <Button key="retry" onClick={() => window.location.reload()}>
                Thử lại
              </Button>,
            ]}
          />

          {verificationLink && (
            <Descriptions title="Thông tin link" bordered column={1} className="mt-6">
              <Descriptions.Item label="Mã xác thực">
                <strong>{verificationLink.verificationCode}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Cổ đông">
                {verificationLink.shareholder?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Cuộc họp">
                {verificationLink.meeting?.meetingName}
              </Descriptions.Item>
            </Descriptions>
          )}
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
            extra={[
              <Button type="primary" key="home" href="/">
                Về trang chủ
              </Button>,
            ]}
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
            extra={[
              <Button type="primary" key="home" href="/">
                Về trang chủ
              </Button>,
            ]}
          />
          
          <Descriptions title="Thông tin link" bordered column={1} className="mt-6">
            <Descriptions.Item label="Mã xác thực">
              <strong>{verificationLink.verificationCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cổ đông">
              {verificationLink.shareholder?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {verificationLink.meeting?.meetingName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời hạn">
              {dayjs(verificationLink.expiresAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    )
  }

  // HIỂN THỊ FORM XÁC THỰC (chỉ khi chưa verify và link còn hiệu lực)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Xác Thực Tham Dự</h1>
          <p className="text-gray-600">Vui lòng xác nhận thông tin bên dưới</p>
        </div>

        <Alert
          message="Thông báo quan trọng"
          description="Việc xác thực này sẽ ghi nhận sự tham dự của bạn vào cuộc họp. Vui lòng đảm bảo thông tin là chính xác."
          type="info"
          showIcon
          className="mb-6"
        />

        <Descriptions title="Thông tin xác thực" bordered column={1}>
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
          <Descriptions.Item label="Loại xác thực">
            <Tag color="blue">{verificationLink.verificationType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thời hạn">
            {dayjs(verificationLink.expiresAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <div className="flex justify-center gap-4 mt-8">
          <Button 
            type="primary" 
            size="large"
            loading={isVerifying}
            onClick={handleVerify}
            icon={<CheckCircleOutlined />}
          >
            Xác nhận xác thực
          </Button>
          <Button size="large" href="/">
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  )
}
// src/app/verify/[code]/meetings/[meetingId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Result, Button, Spin, Descriptions, Tag, Alert } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useVerifyLinkWithMeeting } from '@/hooks/verification/useVerifyLinkWithMeeting'
import { useVerificationLinkByCode } from '@/hooks/verification/useVerificationLinkByCode'
import dayjs from 'dayjs'

export default function VerifyWithMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const verificationCode = params.code as string
  const meetingId = parseInt(params.meetingId as string)
  
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasAutoVerified, setHasAutoVerified] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false) // 🔥 THÊM: Theo dõi đã redirect chưa
  
  // Thử dùng hook thông thường trước như fallback
  const { 
    data: linkResponse, 
    isLoading, 
    error: linkError 
  } = useVerificationLinkByCode(verificationCode)
  
  const { mutateAsync: verifyLinkWithMeeting } = useVerifyLinkWithMeeting()

  // Extract data từ response
  const verificationLink = linkResponse?.data

  console.log('🔍 Debug Verification with Meeting:', {
    verificationCode,
    meetingId,
    linkResponse,
    verificationLink,
    verificationResult,
    hasAutoVerified,
    isVerifying,
    useFallback
  })

  // Kiểm tra xem link có thuộc meeting không
  const isLinkForThisMeeting = verificationLink?.meetingId === meetingId

  useEffect(() => {
    // Nếu link không thuộc meeting này, dùng fallback
    if (verificationLink && !isLinkForThisMeeting) {
      console.log('⚠️ Link không thuộc meeting này, sử dụng fallback')
      setUseFallback(true)
    }
  }, [verificationLink, isLinkForThisMeeting])

  useEffect(() => {
    // Auto verify khi link hợp lệ, thuộc meeting và chưa verify
    if (verificationLink && 
        isLinkForThisMeeting && 
        !verificationLink.isUsed && 
        !verificationResult && 
        !hasAutoVerified) {
      console.log('🔄 Auto-verifying link with meeting...')
      setHasAutoVerified(true)
      handleVerify()
    }
  }, [verificationLink, isLinkForThisMeeting, verificationResult, hasAutoVerified])

  // 🔥 SỬA: Tự động redirect ngay khi verify thành công
  useEffect(() => {
    if (verificationResult && isVerificationSuccessful(verificationResult) && !hasRedirected) {
      console.log('🎉 Verification successful, auto-redirecting...')
      setHasRedirected(true)
      
      // Redirect ngay lập tức
      const redirectUrl = `/meetings/${meetingId}/${verificationCode}`
      console.log('🔄 Auto-redirecting to:', redirectUrl)
      
      // Redirect sau 1 giây để user kịp thấy thông báo thành công
      setTimeout(() => {
        router.push(redirectUrl)
      }, 1000)
    }
  }, [verificationResult, hasRedirected, meetingId, verificationCode, router])

  const handleVerify = async () => {
    if (!verificationLink) return
    
    setIsVerifying(true)
    try {
      console.log('🚀 Starting verification with meeting...')
      const ipAddress = await getClientIP()
      
      const result = await verifyLinkWithMeeting({
        verificationCode,
        meetingId,
        data: {
          ipAddress,
          userAgent: navigator.userAgent,
        }
      })
      
      console.log('✅ Verification with meeting success:', result)
      setVerificationResult(result)
      
    } catch (error: any) {
      console.error('❌ Verification with meeting failed:', error)
      
      // Thử verify thông thường nếu verify với meeting thất bại
      if (error?.response?.status === 404) {
        console.log('🔄 Trying normal verification as fallback...')
        try {
          // Gọi API verify thông thường
          const normalVerifyResponse = await fetch('/api/verification-links/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              verificationCode,
              ipAddress: await getClientIP(),
              userAgent: navigator.userAgent,
            }),
          })
          
          if (normalVerifyResponse.ok) {
            const normalResult = await normalVerifyResponse.json()
            setVerificationResult(normalResult)
            return
          }
        } catch (normalError) {
          console.error('❌ Normal verification also failed:', normalError)
        }
      }
      
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

  const getStatusInfo = (link: any) => {
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
    return result.success === true && result.data?.verification
  }

  // Hiển thị loading
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip={isVerifying ? "Đang xác thực..." : "Đang tải thông tin..."} />
      </div>
    )
  }

  // Kiểm tra lỗi khi fetch verification link
  if (linkError || !linkResponse?.success) {
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
          subTitle="Không thể tải thông tin xác thực"
          extra={[
            <Button type="primary" key="home" href="/">
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    )
  }

  // Link không thuộc meeting này
  if (!isLinkForThisMeeting && !useFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="warning"
            title="Link không thuộc cuộc họp này"
            subTitle={`Link xác thực này thuộc cuộc họp khác (ID: ${verificationLink.meetingId})`}
            extra={[
              <Button 
                type="primary" 
                key="correct-meeting"
                onClick={() => setUseFallback(true)}
              >
                Vẫn tiếp tục điểm danh
              </Button>,
              <Button key="home" href="/">
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
            <Descriptions.Item label="Cuộc họp thực tế">
              {verificationLink.meeting?.meetingName} (ID: {verificationLink.meetingId})
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp yêu cầu">
              ID: {meetingId}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(verificationLink)

  // 🔥 SỬA: HIỂN THỊ KẾT QUẢ XÁC THỰC THÀNH CÔNG VÀ TỰ ĐỘNG REDIRECT
  if (verificationResult && isVerificationSuccessful(verificationResult)) {
    const resultData = verificationResult.data
    
    console.log('🎉 Verification successful, auto-redirecting...')

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="success"
            title="Điểm danh thành công!"
            subTitle={
              <div>
                <p>{verificationResult.message || "Bạn đã điểm danh thành công"}</p>
                <p className="mt-2 text-blue-600 font-medium">
                  <LoadingOutlined spin /> Đang tự động chuyển hướng đến cuộc họp...
                </p>
              </div>
            }
            // 🔥 XÓA nút "Vào cuộc họp ngay" vì đã tự động redirect
          />

          <Descriptions title="Thông tin điểm danh" bordered column={1} className="mt-6">
            <Descriptions.Item label="Cổ đông">
              <strong>{resultData?.shareholder?.fullName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã cổ đông">
              {resultData?.shareholder?.shareholderCode}
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {resultData?.meeting?.meetingName || verificationLink.meeting?.meetingName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian điểm danh">
              {dayjs().format('DD/MM/YYYY HH:mm:ss')}
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
            title="Điểm danh thất bại"
            subTitle={verificationResult.message || "Đã có lỗi xảy ra trong quá trình điểm danh"}
            extra={[
              <Button type="primary" key="home" href="/">
                Về trang chủ
              </Button>,
              <Button key="retry" onClick={() => window.location.reload()}>
                Thử lại
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
          </Descriptions>
        </Card>
      </div>
    )
  }

  // Link đã được sử dụng trước đó - TỰ ĐỘNG REDIRECT LUÔN
  if (verificationLink.isUsed && !hasRedirected) {
    console.log('🔁 Link đã sử dụng, auto-redirecting...')
    setHasRedirected(true)
    
    // Redirect ngay lập tức
    setTimeout(() => {
      router.push(`/meetings/${meetingId}/${verificationCode}`)
    }, 1000)

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <Result
            status="success"
            title="Đã điểm danh thành công"
            subTitle={
              <div>
                <p>Bạn đã điểm danh cho cuộc họp này trước đó</p>
                <p className="mt-2 text-blue-600 font-medium">
                  <LoadingOutlined spin /> Đang tự động chuyển hướng đến cuộc họp...
                </p>
              </div>
            }
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
            title="Link đã sử dụng"
            subTitle="Link điểm danh này đã sử dụng"
          
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

  // HIỂN THỊ FORM ĐIỂM DANH
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {!isLinkForThisMeeting ? 'Điểm Danh (Liên kết khác cuộc họp)' : 'Điểm Danh Tham Dự'}
          </h1>
          <p className="text-gray-600">Vui lòng xác nhận điểm danh cho cuộc họp</p>
        </div>

        {!isLinkForThisMeeting && (
          <Alert
            message="Cảnh báo"
            description="Link xác thực này thuộc cuộc họp khác. Bạn vẫn có thể tiếp tục điểm danh nếu đây là hành động có chủ đích."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

        <Alert
          message="Thông báo quan trọng"
          description="Sau khi điểm danh thành công, bạn sẽ được tự động chuyển đến trang cuộc họp."
          type="info"
          showIcon
          className="mb-6"
        />

        <Descriptions title="Thông tin điểm danh" bordered column={1}>
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
            {!isLinkForThisMeeting && (
              <div className="text-orange-500 text-sm mt-1">
                ⚠️ Link thuộc cuộc họp ID: {verificationLink.meetingId}
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Thời hạn điểm danh">
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
            Xác nhận điểm danh
          </Button>
          <Button size="large" href="/">
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  )
}
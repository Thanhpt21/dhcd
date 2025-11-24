// src/components/admin/verification/VerificationLinkDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Button, Space, Image, Timeline, Card, message } from 'antd'
import { QrcodeOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons'
import type { VerificationLink } from '@/types/verification.type'
import dayjs from 'dayjs'
import { useGenerateQRCode } from '@/hooks/verification/useGenerateQRCode'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  verification: VerificationLink | null
}

export function VerificationLinkDetailModal({ open, onClose, verification }: Props) {
  const { mutateAsync: generateQRCode } = useGenerateQRCode()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const handleGenerateQRCode = async () => {
    if (!verification) return
    
    try {
      const result = await generateQRCode(verification.verificationCode)
      setQrCodeUrl(result.qrCodeUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleCopyCode = () => {
    if (verification) {
      navigator.clipboard.writeText(verification.verificationCode)
        .then(() => {
          message.success('Đã sao chép mã xác thực')
        })
        .catch(err => {
          console.error('Failed to copy: ', err)
          message.error('Sao chép thất bại')
        })
    }
  }

  const handleCopyLink = () => {
    const link = getVerificationLink()
    if (link) {
      navigator.clipboard.writeText(link)
        .then(() => {
          message.success('Đã sao chép link xác thực')
        })
        .catch(err => {
          console.error('Failed to copy: ', err)
          message.error('Sao chép thất bại')
        })
    }
  }

  // Tạo link xác thực chính xác theo loại
  const getVerificationLink = (): string => {
    if (!verification) return ''
    
    const baseUrl = window.location.origin
    const verificationCode = verification.verificationCode
    
    if (verification.verificationType === 'REGISTRATION') {
      // Link đăng ký: /verify/{code}
      return `${baseUrl}/verify/${verificationCode}`
    } else {
      // Link điểm danh: /verify/{code}/meetings/{meetingId}
      return `${baseUrl}/verify/${verificationCode}/meetings/${verification.meetingId}`
    }
  }

  const getStatusInfo = (record: VerificationLink) => {
    if (record.isUsed) {
      return { color: 'green', text: 'Đã sử dụng' }
    }
    if (dayjs().isAfter(dayjs(record.expiresAt))) {
      return { color: 'red', text: 'Đã hết hạn' }
    }
    return { color: 'blue', text: 'Hoạt động' }
  }

  const getVerificationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      REGISTRATION: 'blue',
      ATTENDANCE: 'green',
    }
    return colors[type] || 'default'
  }

  const getVerificationTypeText = (type: string) => {
    const texts: Record<string, string> = {
      REGISTRATION: 'Đăng ký tham dự',
      ATTENDANCE: 'Điểm danh tham dự',
    }
    return texts[type] || type
  }

  if (!verification) return null

  const statusInfo = getStatusInfo(verification)
  const verificationLink = getVerificationLink()

  return (
    <Modal
      title="Chi Tiết Link Xác Thực"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mã xác thực" span={2}>
              <Space>
                <strong className="font-mono">{verification.verificationCode}</strong>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={handleCopyCode}
                >
                  Copy
                </Button>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Loại xác thực">
              <Tag color={getVerificationTypeColor(verification.verificationType)}>
                {getVerificationTypeText(verification.verificationType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cuộc họp">
              {verification.meeting?.meetingName}
              {verification.meetingId && (
                <div className="text-xs text-gray-500">ID: {verification.meetingId}</div>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Cổ đông">
              <div>
                <div>{verification.shareholder?.fullName}</div>
                <div className="text-xs text-gray-500">Mã: {verification.shareholder?.shareholderCode}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời hạn">
              {dayjs(verification.expiresAt).format('DD/MM/YYYY HH:mm')}
              <div className="text-xs text-gray-500">
                ({dayjs().isAfter(dayjs(verification.expiresAt)) ? 'Đã hết hạn' : 'Còn hiệu lực'})
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(verification.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            {verification.isUsed && (
              <>
                <Descriptions.Item label="Thời gian sử dụng">
                  {verification.usedAt ? dayjs(verification.usedAt).format('DD/MM/YYYY HH:mm') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="IP sử dụng">
                  {verification.usedIp || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Thiết bị" span={2}>
                  {verification.usedDevice || '—'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>

        {/* QR Code Section */}
        <Card 
          title="QR Code" 
          size="small"
          extra={
            <Button 
              type="primary"
              icon={<QrcodeOutlined />} 
              onClick={handleGenerateQRCode}
              disabled={!verificationLink}
            >
              Tạo QR Code
            </Button>
          }
        >
          {qrCodeUrl ? (
            <div className="flex flex-col items-center">
              <Image
                width={200}
                src={qrCodeUrl}
                alt="QR Code"
                preview={false}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                Quét QR code để xác thực {getVerificationTypeText(verification.verificationType).toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <QrcodeOutlined style={{ fontSize: 48, marginBottom: 8 }} />
              <p>Nhấn "Tạo QR Code" để hiển thị mã</p>
              <p className="text-xs mt-1">QR Code sẽ chứa link xác thực bên dưới</p>
            </div>
          )}
        </Card>

        {/* Verification URL */}
        <Card title="Link xác thực" size="small">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-600 break-all font-mono text-sm">
                {verificationLink}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Định dạng: {verification.verificationType === 'REGISTRATION' 
                  ? '/verify/{code}' 
                  : '/verify/{code}/meetings/{meetingId}'
                }
              </div>
              <Space>
                <Button 
                  type="link" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyLink}
                >
                  Copy Link
                </Button>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(verificationLink, '_blank')}
                  disabled={!verificationLink}
                >
                  Mở Link
                </Button>
              </Space>
            </div>
          </div>
        </Card>

        {/* Email Status */}
        <Card title="Trạng thái Email" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Đã gửi email">
              <Tag color={verification.emailSent ? 'green' : 'red'}>
                {verification.emailSent ? 'Đã gửi' : 'Chưa gửi'}
              </Tag>
            </Descriptions.Item>
            {verification.emailSentAt && (
              <Descriptions.Item label="Thời gian gửi">
                {dayjs(verification.emailSentAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Recent Logs */}
        {verification.recentLogs && verification.recentLogs.length > 0 && (
          <Card title="Lịch sử xác thực gần đây" size="small">
            <Timeline>
              {verification.recentLogs.slice(0, 5).map((log) => (
                <Timeline.Item
                  key={log.id}
                  color={log.success ? 'green' : 'red'}
                >
                  <div className="flex justify-between">
                    <span>
                      <strong>{log.action}</strong>
                      {log.errorMessage && (
                        <div className="text-red-500 text-xs">Lỗi: {log.errorMessage}</div>
                      )}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  {log.ipAddress && (
                    <div className="text-gray-500 text-xs">
                      IP: {log.ipAddress}
                    </div>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
            {verification.logCount && verification.logCount > 5 && (
              <div className="text-center text-gray-500 text-sm mt-2">
                Và {verification.logCount - 5} bản ghi khác...
              </div>
            )}
          </Card>
        )}
      </div>
    </Modal>
  )
}
// src/components/admin/verification/VerificationLinksTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Card, Statistic, Row, Col, Dropdown, MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useVerificationLinks } from '@/hooks/verification/useVerificationLinks'
import { useDeleteVerificationLink } from '@/hooks/verification/useDeleteVerificationLink'
import { useRevokeVerificationLink } from '@/hooks/verification/useRevokeVerificationLink'
import { useVerificationStatistics } from '@/hooks/verification/useVerificationStatistics'
import { useSendVerificationEmail } from '@/hooks/verification/useSendVerificationEmail'
import { useResendVerificationEmail } from '@/hooks/verification/useResendVerificationEmail'
import { useSendVerificationSuccessEmail } from '@/hooks/verification/useSendVerificationSuccessEmail'
import { useEmailStatistics } from '@/hooks/verification/useEmailStatistics'
import type { VerificationLink } from '@/types/verification.type'
import { VerificationLinkCreateModal } from './VerificationLinkCreateModal'
import { VerificationLinkGenerateBatchModal } from './VerificationLinkGenerateBatchModal'
import { VerificationLinkDetailModal } from './VerificationLinkDetailModal'
import { SendBatchEmailsModal } from './SendBatchEmailsModal'
import { useQueryClient } from '@tanstack/react-query' 
import dayjs from 'dayjs'

const { Option } = Select

export default function VerificationLinksTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingIdFilter, setMeetingIdFilter] = useState('')
  const [shareholderIdFilter, setShareholderIdFilter] = useState('')
  const [verificationTypeFilter, setVerificationTypeFilter] = useState('')
  const [isUsedFilter, setIsUsedFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openGenerateBatch, setOpenGenerateBatch] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openSendBatch, setOpenSendBatch] = useState(false)
  const [emailSent, setEmailSentFilter] = useState('') 
  const [selectedVerification, setSelectedVerification] = useState<VerificationLink | null>(null)
  const queryClient = useQueryClient() 

  const { data, isLoading, refetch } = useVerificationLinks(
    page, 
    10, 
    meetingIdFilter, 
    shareholderIdFilter, 
    verificationTypeFilter, 
    isUsedFilter, 
    search,
    emailSent
  )

  const handleRefresh = () => {
    refetch?.()
    queryClient.invalidateQueries({ queryKey: ['verificationLinks'] })
    queryClient.invalidateQueries({ queryKey: ['verificationStatistics'] })
    queryClient.invalidateQueries({ queryKey: ['emailStatistics'] })
    message.success('Đã làm mới dữ liệu')
  }

  const { data: statistics } = useVerificationStatistics(Number(meetingIdFilter))
  const { data: emailStats } = useEmailStatistics(Number(meetingIdFilter))
  
  const { mutateAsync: deleteVerificationLink } = useDeleteVerificationLink()
  const { mutateAsync: revokeVerificationLink } = useRevokeVerificationLink()
  const { mutateAsync: sendVerificationEmail } = useSendVerificationEmail()
  const { mutateAsync: resendVerificationEmail } = useResendVerificationEmail()
  const { mutateAsync: sendVerificationSuccessEmail } = useSendVerificationSuccessEmail()

  const getVerificationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      REGISTRATION: 'blue',
      ATTENDANCE: 'green',
    }
    return colors[type] || 'default'
  }

  const getVerificationTypeText = (type: string) => {
    const texts: Record<string, string> = {
      REGISTRATION: 'Đăng ký',
      ATTENDANCE: 'Điểm danh',
    }
    return texts[type] || type
  }

  const getStatusInfo = (record: VerificationLink) => {
    if (record.isUsed) {
      return { color: 'green', text: 'Đã xác thực', icon: <CheckCircleOutlined /> }
    }
    if (dayjs().isAfter(dayjs(record.expiresAt))) {
      return { color: 'red', text: 'Đã hết hạn', icon: <CloseCircleOutlined /> }
    }
    return { color: 'blue', text: 'Chờ xác thực', icon: <SyncOutlined /> }
  }

  const getEmailStatusInfo = (record: VerificationLink) => {
    if (record.emailSent) {
        return { 
        color: 'green', 
        text: 'Đã gửi email', 
        icon: <CheckCircleOutlined />,
        tooltip: `Gửi lúc: ${dayjs(record.emailSentAt).format('DD/MM/YYYY HH:mm')}`
        }
    }
    return { 
        color: 'orange', 
        text: 'Chưa gửi email', 
        icon: <CloseCircleOutlined />,
        tooltip: 'Chưa gửi email xác thực'
    }
    }

  const handleRevoke = async (id: number) => {
    try {
      await revokeVerificationLink(id)
      message.success('Thu hồi link thành công')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thu hồi thất bại')
    }
  }

  const handleSendEmail = async (verificationLinkId: number) => {
    try {
      await sendVerificationEmail({ verificationLinkId })
      message.success('Gửi email xác thực thành công')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gửi email thất bại')
    }
  }

  const handleResendEmail = async (verificationLinkId: number) => {
    try {
      await resendVerificationEmail({ verificationLinkId })
      message.success('Gửi lại email thành công')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gửi lại email thất bại')
    }
  }

  const handleSendSuccessEmail = async (verificationCode: string) => {
    try {
      await sendVerificationSuccessEmail({ verificationCode })
      message.success('Gửi email xác nhận thành công')
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gửi email xác nhận thất bại')
    }
  }

  const getEmailActions = (record: VerificationLink): MenuProps['items'] => {
  const hasEmail = !!record.shareholder?.email
  
  // Nếu chưa gửi email - chỉ hiển thị "Gửi email xác thực"
  if (!record.emailSent) {
    return [
      {
        key: 'send-verification',
        label: 'Gửi email xác thực',
        icon: <MailOutlined />,
        onClick: () => handleSendEmail(record.id),
        disabled: !hasEmail,
        title: !hasEmail ? 'Cổ đông không có email' : undefined
      }
    ]
  }

  // Nếu đã gửi email - hiển thị "Gửi lại email" và "Gửi email xác nhận" (nếu đã xác thực)
  const actions = [
    {
      key: 'resend-verification',
      label: 'Gửi lại email',
      icon: <SyncOutlined />,
      onClick: () => handleResendEmail(record.id),
      disabled: !hasEmail,
      title: !hasEmail ? 'Cổ đông không có email' : undefined
    }
  ]

  // Thêm "Gửi email xác nhận" nếu đã xác thực
  if (record.isUsed) {
    actions.push({
      key: 'send-success',
      label: 'Gửi email xác nhận',
      icon: <CheckCircleOutlined />,
      onClick: () => handleSendSuccessEmail(record.verificationCode),
      disabled: !hasEmail,
      title: !hasEmail ? 'Cổ đông không có email' : undefined
    })
  }

  return actions
}

  const columns: ColumnsType<VerificationLink> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã xác thực',
      dataIndex: 'verificationCode',
      key: 'verificationCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Cuộc họp',
      dataIndex: 'meeting',
      key: 'meeting',
      render: (meeting: any) => meeting?.meetingName || '—',
      ellipsis: true,
    },
    {
      title: 'Cổ đông',
      dataIndex: 'shareholder',
      key: 'shareholder',
      render: (shareholder: any) => (
        <div>
          <div>{shareholder?.fullName || '—'}</div>
          {shareholder?.email && (
            <div className="text-xs text-gray-500">{shareholder.email}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'verificationType',
      key: 'verificationType',
      width: 100,
      render: (type: string) => (
        <Tag color={getVerificationTypeColor(type)}>
          {getVerificationTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (record: VerificationLink) => {
        const statusInfo = getStatusInfo(record)
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        )
      },
    },
    {
        title: 'Email',
        key: 'emailStatus',
        width: 150,
        render: (record: VerificationLink) => {
        const emailStatusInfo = getEmailStatusInfo(record)
        return (
            <Tooltip title={emailStatusInfo.tooltip}>
            <Tag color={emailStatusInfo.color} icon={emailStatusInfo.icon}>
                {emailStatusInfo.text}
            </Tag>
            </Tooltip>
        )
        },
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string) => dayjs(expiresAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => {
        const statusInfo = getStatusInfo(record)
        const hasEmail = !!record.shareholder?.email
        
        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedVerification(record)
                  setOpenDetail(true)
                }}
              />
            </Tooltip>
            
            <Dropdown 
              menu={{ items: getEmailActions(record) }} 
              placement="bottomRight"
              trigger={['click']}
              disabled={!hasEmail}
            >
              <Tooltip title={hasEmail ? "Tác vụ email" : "Cổ đông không có email"}>
                <MailOutlined 
                  style={{ 
                    color: hasEmail ? '#52c41a' : '#d9d9d9', 
                    cursor: hasEmail ? 'pointer' : 'not-allowed' 
                  }} 
                />
              </Tooltip>
            </Dropdown>

            {!record.isUsed && statusInfo.color !== 'red' && (
              <Tooltip title="Thu hồi">
                <CloseCircleOutlined
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận thu hồi',
                      content: `Bạn có chắc chắn muốn thu hồi link xác thực này?`,
                      okText: 'Thu hồi',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => handleRevoke(record.id),
                    })
                  }}
                />
              </Tooltip>
            )}

            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ color: 'red', cursor: 'pointer' }}
                onClick={() => {
                  Modal.confirm({
                    title: 'Xác nhận xóa',
                    content: `Bạn có chắc chắn muốn xóa link xác thực này?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await deleteVerificationLink(record.id)
                        message.success('Xóa link thành công')
                        refetch?.()
                      } catch (error: any) {
                        message.error(error?.response?.data?.message || 'Xóa thất bại')
                      }
                    },
                  })
                }}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const handleReset = () => {
    setInputValue('')
    setSearch('')
    setMeetingIdFilter('')
    setShareholderIdFilter('')
    setVerificationTypeFilter('')
    setIsUsedFilter('')
    setPage(1)
  }

  return (
    <div>
      {/* Statistics Cards */}
      {(statistics || emailStats) && (
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Tổng số link"
                  value={statistics?.totalLinks || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Đã xác thực"
                  value={statistics?.usedLinks || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Chờ xác thực"
                  value={statistics?.activeLinks || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Tỷ lệ sử dụng"
                  value={statistics?.usageRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Email đã gửi"
                  value={emailStats?.totalSent || 0}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Tỷ lệ thành công"
                  value={emailStats?.successRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo mã, tên cổ đông..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Select
            placeholder="Loại xác thực"
            value={verificationTypeFilter || undefined}
            onChange={setVerificationTypeFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="REGISTRATION">Đăng ký</Option>
            <Option value="ATTENDANCE">Điểm danh</Option>
          </Select>
          <Select
            placeholder="Trạng thái"
            value={isUsedFilter || undefined}
            onChange={setIsUsedFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="false">Chờ xác thực</Option>
            <Option value="true">Đã xác thực</Option>
          </Select>
           <Select
                placeholder="Trạng thái email"
                value={emailSent || undefined}
                onChange={setEmailSentFilter}
                allowClear
                style={{ width: 150 }}
            >
                <Option value="true">Đã gửi email</Option>
                <Option value="false">Chưa gửi email</Option>
            </Select>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>
            Đặt lại
          </Button>
           <Tooltip title="Làm mới dữ liệu">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={isLoading}
            >
              Làm mới
            </Button>
          </Tooltip>
        </div>

        <Space>
          <Button 
            type="dashed" 
            icon={<MailOutlined />} 
            onClick={() => setOpenSendBatch(true)}
          >
            Gửi email hàng loạt
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setOpenGenerateBatch(true)}
          >
            Tạo link
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} link xác thực`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1200 }}
      />

      <VerificationLinkGenerateBatchModal
        open={openGenerateBatch}
        onClose={() => setOpenGenerateBatch(false)}
        refetch={refetch}
      />

      <VerificationLinkDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        verification={selectedVerification}
      />

      <SendBatchEmailsModal
        open={openSendBatch}
        onClose={() => setOpenSendBatch(false)}
        refetch={refetch}
      />
    </div>
  )
}
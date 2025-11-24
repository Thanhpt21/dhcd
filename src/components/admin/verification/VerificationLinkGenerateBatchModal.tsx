// src/components/admin/verification/VerificationLinkGenerateBatchModal.tsx
'use client'

import { Modal, Form, Select, InputNumber, Button, message, Table, Tag, Space } from 'antd'
import { useState, useEffect } from 'react'
import { useGenerateBatchVerificationLinks } from '@/hooks/verification/useGenerateBatchVerificationLinks'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import { useMeetingRegistrations } from '@/hooks/registration/useMeetingRegistrations'
import type { Shareholder } from '@/types/shareholder.type'
import type { Registration } from '@/types/registration.type'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

interface TableData {
  id: number
  shareholderId: number
  shareholderCode: string
  fullName: string
  email?: string
  totalShares?: number
  idNumber?: string
  isActive?: boolean
  registrationType?: string
  status?: string
  sharesRegistered?: number
}

export function VerificationLinkGenerateBatchModal({ open, onClose, refetch }: Props) {
  const [form] = Form.useForm()
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)
  const [selectedShareholders, setSelectedShareholders] = useState<number[]>([])
  const [verificationType, setVerificationType] = useState<'REGISTRATION' | 'ATTENDANCE'>('REGISTRATION')
  
  const { mutateAsync: generateBatch, isPending } = useGenerateBatchVerificationLinks()
  const { data: meetings } = useAllMeetings()
  const { data: shareholders, isLoading: isLoadingShareholders } = useAllShareholders()
  const { data: registrations, isLoading: isLoadingRegistrations } = useMeetingRegistrations(
    selectedMeetingId || 0
  )

  useEffect(() => {
    if (open) {
      form.resetFields()
      setSelectedMeetingId(null)
      setSelectedShareholders([])
      setVerificationType('REGISTRATION')
      form.setFieldValue('expiresInHours', 24)
      form.setFieldValue('verificationType', 'REGISTRATION')
    }
  }, [open, form])

  const handleMeetingChange = (meetingId: number) => {
    setSelectedMeetingId(meetingId)
    setSelectedShareholders([])
  }

  const handleVerificationTypeChange = (type: 'REGISTRATION' | 'ATTENDANCE') => {
    setVerificationType(type)
    setSelectedShareholders([])
  }

  const handleSubmit = async (values: any) => {
    if (selectedShareholders.length === 0) {
      message.error('Vui lòng chọn ít nhất một cổ đông')
      return
    }

    if (!selectedMeetingId) {
      message.error('Vui lòng chọn cuộc họp')
      return
    }

    try {
      await generateBatch({
        meetingId: selectedMeetingId,
        shareholderIds: selectedShareholders,
        verificationType: values.verificationType,
        expiresInHours: values.expiresInHours,
      })
      message.success(`Tạo ${selectedShareholders.length} link xác thực thành công`)
      refetch?.()
      onClose()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạo link thất bại')
    }
  }

  // Chuyển đổi dữ liệu thành format chung
  const getDisplayData = (): TableData[] => {
    if (verificationType === 'ATTENDANCE') {
      // Điểm danh: chỉ hiển thị cổ đông đã đăng ký
      return (registrations || []).map((reg: Registration) => ({
        id: reg.shareholderId,
        shareholderId: reg.shareholderId,
        shareholderCode: reg.shareholder.shareholderCode,
        fullName: reg.shareholder.fullName,
        email: reg.shareholder.email,
        totalShares: reg.shareholder.totalShares,
        idNumber: reg.shareholder.idNumber,
        isActive: reg.shareholder.isActive,
        registrationType: reg.registrationType,
        status: reg.status,
        sharesRegistered: reg.sharesRegistered
      }))
    } else {
      // Đăng ký: hiển thị tất cả cổ đông
      return (shareholders || []).map((sh: Shareholder) => ({
        id: sh.id,
        shareholderId: sh.id,
        shareholderCode: sh.shareholderCode,
        fullName: sh.fullName,
        email: sh.email,
        totalShares: sh.totalShares,
        idNumber: sh.idNumber,
        isActive: sh.isActive
      }))
    }
  }

  const columns: ColumnsType<TableData> = [
    {
      title: 'Mã cổ đông',
      dataIndex: 'shareholderCode',
      key: 'shareholderCode',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || <Tag color="orange">Chưa có email</Tag>,
    },
    {
      title: 'Số cổ phần',
      dataIndex: 'totalShares',
      key: 'totalShares',
      render: (shares: number) => shares?.toLocaleString() || '0',
    },
    ...(verificationType === 'ATTENDANCE' ? [
      {
        title: 'Loại đăng ký',
        dataIndex: 'registrationType',
        key: 'registrationType',
        render: (type: string) => {
          const typeConfig = {
            'IN_PERSON': { color: 'blue', text: 'Trực tiếp' },
            'PROXY': { color: 'purple', text: 'Ủy quyền' },
            'ONLINE': { color: 'green', text: 'Trực tuyến' },
          }
          const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: type }
          return <Tag color={config.color}>{config.text}</Tag>
        },
      },
      {
        title: 'Trạng thái ĐK',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const statusConfig = {
            'PENDING': { color: 'orange', text: 'Chờ duyệt' },
            'APPROVED': { color: 'green', text: 'Đã duyệt' },
            'REJECTED': { color: 'red', text: 'Từ chối' },
            'CANCELLED': { color: 'gray', text: 'Đã hủy' },
          }
          const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
          return <Tag color={config.color}>{config.text}</Tag>
        },
      }
    ] : []),
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái email',
      key: 'emailStatus',
      render: (_, record) => (
        <Tag color={record.email ? 'green' : 'red'}>
          {record.email ? 'Có email' : 'Không có email'}
        </Tag>
      ),
    },
  ]

  // Row selection config
  const rowSelection = {
    selectedRowKeys: selectedShareholders,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedShareholders(selectedKeys as number[])
    },
  }

  const displayData = getDisplayData()
  const isLoading = verificationType === 'ATTENDANCE' ? isLoadingRegistrations : isLoadingShareholders

  return (
    <Modal
      title="Tạo Link Xác Thực Hàng Loạt"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="meetingId"
            label="Cuộc họp"
            rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
          >
            <Select 
              placeholder="Chọn cuộc họp" 
              showSearch 
              optionFilterProp="label"
              onChange={handleMeetingChange}
              loading={!meetings}
            >
              {meetings?.map((meeting: any) => (
                <Option key={meeting.id} value={meeting.id} label={meeting.meetingName}>
                  {meeting.meetingName} ({new Date(meeting.meetingDate).toLocaleDateString('vi-VN')})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="verificationType"
            label="Loại xác thực"
            rules={[{ required: true, message: 'Vui lòng chọn loại xác thực' }]}
          >
            <Select 
              placeholder="Chọn loại xác thực"
              onChange={handleVerificationTypeChange}
            >
              <Option value="REGISTRATION">Đăng ký</Option>
              <Option value="ATTENDANCE">Điểm danh</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="expiresInHours"
          label="Thời hạn (giờ)"
          rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
        >
          <InputNumber 
            min={1} 
            max={720} 
            style={{ width: '100%' }} 
            placeholder="Số giờ có hiệu lực"
          />
        </Form.Item>

        <Form.Item label={`Chọn cổ đông ${verificationType === 'ATTENDANCE' ? '(đã đăng ký)' : '(tất cả)'}`}>
          {!selectedMeetingId && verificationType === 'ATTENDANCE' ? (
            <div className="text-center py-8 text-gray-500">
              Vui lòng chọn cuộc họp để hiển thị danh sách cổ đông đã đăng ký
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Đang tải danh sách cổ đông...</div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">
                    Đã chọn: <strong>{selectedShareholders.length}</strong> / {displayData.length} cổ đông
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {verificationType === 'ATTENDANCE' 
                      ? '* Hiển thị cổ đông đã đăng ký cho cuộc họp này' 
                      : '* Hiển thị tất cả cổ đông trong hệ thống'
                    }
                  </div>
                </div>
                {selectedShareholders.length > 0 && (
                  <Space>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedShareholders([])}
                      className="text-red-500"
                    >
                      Bỏ chọn tất cả
                    </Button>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => {
                        const allIds = displayData.map((item) => item.shareholderId)
                        setSelectedShareholders(allIds)
                      }}
                      className="text-blue-500"
                    >
                      Chọn tất cả
                    </Button>
                  </Space>
                )}
              </div>
              
              <Table<TableData>
                size="small"
                columns={columns}
                dataSource={displayData}
                rowKey="shareholderId"
                loading={isLoading}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} cổ đông`,
                }}
                scroll={{ y: 300 }}
                rowSelection={rowSelection}
                locale={{ 
                  emptyText: verificationType === 'ATTENDANCE' 
                    ? 'Không có cổ đông nào đã đăng ký cho cuộc họp này' 
                    : 'Không có cổ đông nào trong hệ thống'
                }}
              />
            </>
          )}
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending}
            disabled={selectedShareholders.length === 0 || !selectedMeetingId}
          >
            Tạo {selectedShareholders.length} Link
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
// src/components/admin/verification/VerificationLinkGenerateBatchModal.tsx
'use client'

import { Modal, Form, Select, InputNumber, Button, message, Table, Tag, Space, Alert, Descriptions } from 'antd'
import { useState, useEffect, useMemo } from 'react'
import { useGenerateBatchVerificationLinks } from '@/hooks/verification/useGenerateBatchVerificationLinks'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import { useMeetingRegistrations } from '@/hooks/registration/useMeetingRegistrations'
import { useMeetingAttendances } from '@/hooks/attendance/useMeetingAttendances'
import type { Shareholder } from '@/types/shareholder.type'
import type { Registration } from '@/types/registration.type'
import type { Attendance } from '@/types/attendance.type'
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
  hasExistingRecord?: boolean
  existingRecordType?: 'ATTENDANCE' | 'REGISTRATION'
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

  const { data: attendances } = useMeetingAttendances(
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

  // ✅ Lấy thông tin meeting được chọn
  const selectedMeeting = useMemo(() => {
    return meetings?.find((meeting: any) => meeting.id === selectedMeetingId) || null
  }, [meetings, selectedMeetingId])

  // ✅ Kiểm tra thời gian đăng ký
  const isWithinRegistrationTime = useMemo(() => {
    if (!selectedMeeting || !selectedMeeting.registrationStart || !selectedMeeting.registrationEnd) {
      return false
    }
    
    const now = new Date()
    const registrationStart = new Date(selectedMeeting.registrationStart)
    const registrationEnd = new Date(selectedMeeting.registrationEnd)
    
    return now >= registrationStart && now <= registrationEnd
  }, [selectedMeeting])

  // ✅ Kiểm tra có thể tạo link không
  const canCreateLinks = useMemo(() => {
    if (verificationType === 'REGISTRATION') {
      return isWithinRegistrationTime
    }
    return true // Điểm danh không bị giới hạn thời gian
  }, [verificationType, isWithinRegistrationTime])

  const handleMeetingChange = (meetingId: number) => {
    setSelectedMeetingId(meetingId)
    setSelectedShareholders([])
  }

  const handleVerificationTypeChange = (type: 'REGISTRATION' | 'ATTENDANCE') => {
    setVerificationType(type)
    setSelectedShareholders([])
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

  const existingAttendanceShareholderIds = useMemo(() => {
    return new Set(attendances?.map((att: Attendance) => att.shareholderId) || [])
  }, [attendances])

  const existingRegistrationShareholderIds = useMemo(() => {
    return new Set(registrations?.map((reg: Registration) => reg.shareholderId) || [])
  }, [registrations])

  const handleSubmit = async (values: any) => {
    if (selectedShareholders.length === 0) {
      message.error('Vui lòng chọn ít nhất một cổ đông')
      return
    }

    if (!selectedMeetingId) {
      message.error('Vui lòng chọn cuộc họp')
      return
    }

    // ✅ Kiểm tra thời gian đăng ký
    if (verificationType === 'REGISTRATION' && !isWithinRegistrationTime) {
      message.error('Không thể tạo link đăng ký vì ngoài thời gian đăng ký')
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

  const getDisplayData = (): TableData[] => {
    let baseData: TableData[] = []

    if (verificationType === 'ATTENDANCE') {
      baseData = (registrations || []).map((reg: Registration) => ({
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
        sharesRegistered: reg.sharesRegistered,
        hasExistingRecord: existingAttendanceShareholderIds.has(reg.shareholderId),
        existingRecordType: 'ATTENDANCE'
      }))
    } else {
      baseData = (shareholders || []).map((sh: Shareholder) => ({
        id: sh.id,
        shareholderId: sh.id,
        shareholderCode: sh.shareholderCode,
        fullName: sh.fullName,
        email: sh.email,
        totalShares: sh.totalShares,
        idNumber: sh.idNumber,
        isActive: sh.isActive,
        hasExistingRecord: existingRegistrationShareholderIds.has(sh.id),
        existingRecordType: 'REGISTRATION'
      }))
    }

    return baseData
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
    {
      title: 'Trạng thái',
      key: 'existingStatus',
      render: (_, record) => {
        if (record.hasExistingRecord) {
          return (
            <Tag color="orange">
              Đã {record.existingRecordType === 'ATTENDANCE' ? 'điểm danh' : 'đăng ký'}
            </Tag>
          )
        }
        return (
          <Tag color="green">
            Chưa {verificationType === 'ATTENDANCE' ? 'điểm danh' : 'đăng ký'}
          </Tag>
        )
      },
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
      title: 'Hoạt động',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys: selectedShareholders,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedShareholders(selectedKeys as number[])
    },
    getCheckboxProps: (record: TableData) => ({
      disabled: record.hasExistingRecord,
    }),
  }

  const displayData = getDisplayData()
  const isLoading = verificationType === 'ATTENDANCE' ? isLoadingRegistrations : isLoadingShareholders

  const stats = useMemo(() => {
    const total = displayData.length
    const existingCount = displayData.filter(item => item.hasExistingRecord).length
    const availableCount = total - existingCount
    const selectedExistingCount = selectedShareholders.filter(id => 
      displayData.find(item => item.shareholderId === id && item.hasExistingRecord)
    ).length

    return { total, existingCount, availableCount, selectedExistingCount }
  }, [displayData, selectedShareholders])

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

        {/* ✅ HIỂN THỊ THÔNG TIN THỜI GIAN ĐĂNG KÝ */}
        {selectedMeeting && verificationType === 'REGISTRATION' && (
          <Alert
            message="Thông tin thời gian đăng ký"
            description={
              <Descriptions size="small" column={2} className="mt-2">
                <Descriptions.Item label="Bắt đầu" span={1}>
                  {formatDateTime(selectedMeeting.registrationStart)}
                </Descriptions.Item>
                <Descriptions.Item label="Kết thúc" span={1}>
                  {formatDateTime(selectedMeeting.registrationEnd)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag color={isWithinRegistrationTime ? 'green' : 'red'}>
                    {isWithinRegistrationTime ? 'Đang trong thời gian đăng ký' : 'Ngoài thời gian đăng ký'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            }
            type={isWithinRegistrationTime ? 'info' : 'error'}
            showIcon
            className="mb-4"
          />
        )}

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

        {/* Thống kê */}
        <Alert
          message={`Thống kê: ${stats.availableCount} cổ đông có thể tạo link / ${stats.total} tổng số`}
          description={
            stats.existingCount > 0 
              ? `Đã có ${stats.existingCount} cổ đông ${verificationType === 'ATTENDANCE' ? 'điểm danh' : 'đăng ký'} (không thể chọn)`
              : 'Tất cả cổ đông đều có thể tạo link'
          }
          type={stats.availableCount > 0 ? 'info' : 'warning'}
          showIcon
          className="mb-4"
        />

        {stats.selectedExistingCount > 0 && (
          <Alert
            message={`Đang chọn ${stats.selectedExistingCount} cổ đông đã ${verificationType === 'ATTENDANCE' ? 'điểm danh' : 'đăng ký'}`}
            description="Những cổ đông này sẽ không được tạo link mới"
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

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
                    Đã chọn: <strong>{selectedShareholders.length}</strong> / {stats.availableCount} cổ đông có thể chọn
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
                        const availableIds = displayData
                          .filter(item => !item.hasExistingRecord)
                          .map(item => item.shareholderId)
                        setSelectedShareholders(availableIds)
                      }}
                      className="text-blue-500"
                    >
                      Chọn tất cả có thể
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
            disabled={selectedShareholders.length === 0 || !selectedMeetingId || !canCreateLinks}
          >
            {!canCreateLinks && verificationType === 'REGISTRATION' 
              ? 'Ngoài thời gian đăng ký' 
              : `Tạo ${selectedShareholders.length} Link`
            }
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
// src/components/admin/registration/RegistrationCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Alert, Descriptions, Card } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateRegistration } from '@/hooks/registration/useCreateRegistration'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import { useProxiesByShareholder } from '@/hooks/proxy/useProxiesByShareholder'
import type { RegistrationType, RegistrationStatus } from '@/types/registration.type'
import type { Proxy } from '@/types/proxy.type'
import dayjs from 'dayjs'
import { UserOutlined, IdcardOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface RegistrationCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const RegistrationCreateModal = ({
  open,
  onClose,
  refetch,
}: RegistrationCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateRegistration()
  const { data: shareholders } = useAllShareholders()
  const [meetingOptions, setMeetingOptions] = useState<{ value: number; label: string }[]>([])
  const [selectedShareholderId, setSelectedShareholderId] = useState<number | null>(null)
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null)

  // 🎯 THÊM: Sử dụng Form.useWatch để theo dõi giá trị registrationType
  const registrationType = Form.useWatch('registrationType', form)

  // Sử dụng hook mới để lấy proxies theo shareholder
  const { data: proxies, isLoading: isLoadingProxies } = useProxiesByShareholder(
    selectedShareholderId || 0
  )

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        meetingId: Number(values.meetingId),
        shareholderId: Number(values.shareholderId),
        registrationDate: values.registrationDate?.toISOString(),
        checkinTime: values.checkinTime?.toISOString(),
        sharesRegistered: values.sharesRegistered || 0,
        status: values.status || 'PENDING',
        registrationType: values.registrationType || 'IN_PERSON',
        // Nếu là ủy quyền và có chọn proxy, sử dụng thông tin từ proxy
        ...(values.registrationType === 'PROXY' && selectedProxy && {
          proxyName: selectedProxy.proxyPerson?.fullName,
          proxyIdNumber: selectedProxy.proxyPerson?.idNumber,
          proxyRelationship: 'Được ủy quyền',
          proxyDocumentUrl: selectedProxy.documentUrl,
          sharesRegistered: selectedProxy.shares
        })
      }
      
      console.log("📤 Payload gửi đi:", payload)
      
      await mutateAsync(payload)
      message.success('Tạo đăng ký thành công')
      onClose()
      form.resetFields()
      setSelectedShareholderId(null)
      setSelectedProxy(null)
      refetch?.()
    } catch (error: any) {
      console.error("❌ Lỗi tạo đăng ký:", error)
      message.error(error?.response?.data?.message || 'Lỗi tạo đăng ký')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setSelectedShareholderId(null)
      setSelectedProxy(null)
    }
  }, [open, form])

  // Mock meetings data
  useEffect(() => {
    setMeetingOptions([
      { value: 1, label: 'ĐHCD thường niên 2024 - 15/03/2024' },
      { value: 2, label: 'ĐHCD bất thường - 20/04/2024' },
    ])
  }, [])

  // Lọc chỉ lấy ủy quyền còn hiệu lực và đã được duyệt
  const availableProxies = proxies?.filter((proxy: Proxy) => 
    proxy.status === 'APPROVED' && 
    dayjs().isBefore(dayjs(proxy.endDate))
  ) || []

  // Khi hình thức tham dự thay đổi
  const handleRegistrationTypeChange = (type: RegistrationType) => {
    if (type !== 'PROXY') {
      setSelectedProxy(null)
      form.setFieldsValue({
        proxyName: undefined,
        proxyIdNumber: undefined,
        proxyRelationship: undefined,
        proxyDocumentUrl: undefined,
        sharesRegistered: form.getFieldValue('sharesRegistered')
      })
    }
  }

  // Khi chọn proxy
  const handleProxyChange = (proxyId: number) => {
    const proxy = availableProxies.find((p: Proxy) => p.id === proxyId)
    setSelectedProxy(proxy || null)
    
    if (proxy) {
      form.setFieldsValue({
        sharesRegistered: proxy.shares,
        proxyName: proxy.proxyPerson?.fullName,
        proxyIdNumber: proxy.proxyPerson?.idNumber,
        proxyRelationship: 'Được ủy quyền',
        proxyDocumentUrl: proxy.documentUrl
      })
    } else {
      form.setFieldsValue({
        proxyName: undefined,
        proxyIdNumber: undefined,
        proxyRelationship: undefined,
        proxyDocumentUrl: undefined
      })
    }
  }

  // Khi shareholder thay đổi, reset proxy selection
  const handleShareholderChange = (value: number) => {
    setSelectedShareholderId(value)
    setSelectedProxy(null)
    form.setFieldsValue({
      proxyName: undefined,
      proxyIdNumber: undefined,
      proxyRelationship: undefined,
      proxyDocumentUrl: undefined
    })
  }

  return (
    <Modal
      title="Thêm đăng ký mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={900}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã đăng ký"
            name="registrationCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã đăng ký' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: REG-2024-001" />
          </Form.Item>

          <Form.Item
            label="Cuộc họp"
            name="meetingId"
            rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
          >
            <Select placeholder="Chọn cuộc họp">
              {meetingOptions.map(meeting => (
                <Option key={meeting.value} value={meeting.value}>
                  {meeting.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Cổ đông"
          name="shareholderId"
          rules={[{ required: true, message: 'Vui lòng chọn cổ đông' }]}
        >
          <Select 
            placeholder="Chọn cổ đông"
            showSearch
            onChange={handleShareholderChange}
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const optionText = String(option?.label || option?.children || '');
              return optionText.toLowerCase().includes(searchText);
            }}
          >
            {shareholders?.map((sh: any) => (
              <Option 
                key={sh.id} 
                value={sh.id}
                label={`${sh.shareholderCode} - ${sh.fullName}`}
              >
                {sh.shareholderCode} - {sh.fullName} ({sh.totalShares.toLocaleString()} CP)
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Hình thức tham dự"
            name="registrationType"
            initialValue="IN_PERSON"
          >
            <Select onChange={handleRegistrationTypeChange}>
              <Option value="IN_PERSON">Trực tiếp</Option>
              <Option value="ONLINE">Trực tuyến</Option>
              <Option value="PROXY">Ủy quyền</Option>
              <Option value="ABSENT">Vắng mặt</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="PENDING"
          >
            <Select>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số cổ phần đăng ký"
            name="sharesRegistered"
            rules={[{ required: true, message: 'Vui lòng nhập số cổ phần' }]}
            initialValue={0}
          >
            <InputNumber 
              min={0}
              style={{ width: '100%' }}
              placeholder="Nhập số cổ phần"
              disabled={!!selectedProxy}
            />
          </Form.Item>
        </div>

        {/* 🎯 SỬA: Sử dụng registrationType từ Form.useWatch thay vì form.getFieldValue */}
        {registrationType === 'PROXY' && selectedShareholderId && (
          <>
            <Form.Item
              label="Chọn ủy quyền"
            >
              <Select 
                placeholder={isLoadingProxies ? "Đang tải ủy quyền..." : "Chọn ủy quyền"}
                onChange={handleProxyChange}
                allowClear
                loading={isLoadingProxies}
                value={selectedProxy?.id || undefined}
              >
                {availableProxies.map((proxy: Proxy) => (
                  <Option key={proxy.id} value={proxy.id}>
                    {proxy.proxyPerson?.fullName} - {proxy.shares.toLocaleString()} cổ phần 
                    (Hiệu lực đến: {dayjs(proxy.endDate).format('DD/MM/YYYY')})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Thông báo khi không có ủy quyền khả dụng */}
            {!isLoadingProxies && availableProxies.length === 0 && (
              <Alert
                message="Không có ủy quyền nào khả dụng"
                description="Cổ đông này không có ủy quyền nào đã được duyệt và còn hiệu lực."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            {/* Hiển thị thông tin người được ủy quyền khi chọn proxy */}
            {selectedProxy && (
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Thông tin người được ủy quyền</span>
                  </div>
                }
                size="small"
                className="mb-4 border-blue-200 bg-blue-50"
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item 
                    label={
                      <div className="flex items-center gap-1">
                        <UserOutlined />
                        <span>Họ tên</span>
                      </div>
                    }
                  >
                    <strong>{selectedProxy.proxyPerson?.fullName}</strong>
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={
                      <div className="flex items-center gap-1">
                        <IdcardOutlined />
                        <span>Số CMND/CCCD</span>
                      </div>
                    }
                  >
                    {selectedProxy.proxyPerson?.idNumber}
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={
                      <div className="flex items-center gap-1">
                        <MailOutlined />
                        <span>Email</span>
                      </div>
                    }
                  >
                    {selectedProxy.proxyPerson?.email}
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={
                      <div className="flex items-center gap-1">
                        <CalendarOutlined />
                        <span>Mã cổ đông</span>
                      </div>
                    }
                  >
                    {selectedProxy.proxyPerson?.shareholderCode}
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label="Số cổ phần ủy quyền"
                    span={2}
                  >
                    <strong className="text-blue-600">{selectedProxy.shares.toLocaleString()} cổ phần</strong>
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label="Hiệu lực đến"
                    span={2}
                  >
                    {dayjs(selectedProxy.endDate).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                </Descriptions>
                
                {selectedProxy.documentUrl && (
                  <div className="mt-2">
                    <Button 
                      type="link" 
                      href={selectedProxy.documentUrl} 
                      target="_blank"
                      size="small"
                    >
                      📎 Xem giấy ủy quyền
                    </Button>
                  </div>
                )}
              </Card>
            )}

           
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Ngày đăng ký"
            name="registrationDate"
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn ngày đăng ký"
            />
          </Form.Item>

          <Form.Item
            label="Thời điểm điểm danh"
            name="checkinTime"
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn thời điểm điểm danh"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Phương thức điểm danh"
          name="checkinMethod"
        >
          <Select placeholder="Chọn phương thức điểm danh">
            <Option value="QR_CODE">Quét QR Code</Option>
            <Option value="MANUAL">Thủ công</Option>
            <Option value="FACE_RECOGNITION">Nhận diện khuôn mặt</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập ghi chú (nếu có)"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
            disabled={registrationType === 'PROXY' && !selectedProxy}
          >
            {registrationType === 'PROXY' && !selectedProxy 
              ? 'Vui lòng chọn ủy quyền' 
              : 'Tạo đăng ký'
            }
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
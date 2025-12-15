// src/components/admin/registration/RegistrationCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Alert, Descriptions, Card, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateRegistration } from '@/hooks/registration/useCreateRegistration'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import { useProxiesByShareholder } from '@/hooks/proxy/useProxiesByShareholder'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import type { RegistrationType } from '@/types/registration.type'
import type { Proxy } from '@/types/proxy.type'
import type { Meeting } from '@/types/meeting.type'
import type { Shareholder } from '@/types/shareholder.type'
import dayjs from 'dayjs'
import { 
  UserOutlined, 
  IdcardOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined,
  CalendarOutlined,
  ShareAltOutlined
} from '@ant-design/icons'

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
  const { data: meetings, isLoading: isLoadingMeetings } = useAllMeetings()
  const [selectedShareholderId, setSelectedShareholderId] = useState<number | null>(null)
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null)
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null)
  const [idNumberInput, setIdNumberInput] = useState<string>('')

  const registrationType = Form.useWatch('registrationType', form)

  const { data: proxies, isLoading: isLoadingProxies } = useProxiesByShareholder(
    selectedShareholderId || 0
  )

  // Tự sinh mã đăng ký
  const generateRegistrationCode = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `REG-${dayjs().format('YYYYMMDD')}-${timestamp}${random}`
  }

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
      setSelectedShareholder(null)
      setIdNumberInput('')
      refetch?.()
    } catch (error: any) {
      console.error("❌ Lỗi tạo đăng ký:", error)
      message.error(error?.response?.data?.message || 'Lỗi tạo đăng ký')
    }
  }

  useEffect(() => {
    if (open) {
      // Tự sinh mã đăng ký khi mở modal
      form.setFieldsValue({
        registrationCode: generateRegistrationCode()
      })
    } else {
      form.resetFields()
      setSelectedShareholderId(null)
      setSelectedProxy(null)
      setSelectedShareholder(null)
      setIdNumberInput('')
    }
  }, [open, form])

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

  // Xử lý khi nhập CCCD
  const handleIdNumberSearch = (value: string) => {
    setIdNumberInput(value)
    
    if (value && shareholders) {
      const shareholder = shareholders.find((sh: Shareholder) => 
        sh.idNumber?.toLowerCase().includes(value.toLowerCase())
      )
      
      if (shareholder) {
        setSelectedShareholderId(shareholder.id)
        setSelectedShareholder(shareholder)
        form.setFieldsValue({
          shareholderId: shareholder.id
        })
      } else {
        setSelectedShareholderId(null)
        setSelectedShareholder(null)
        form.setFieldsValue({
          shareholderId: null
        })
      }
    } else {
      setSelectedShareholderId(null)
      setSelectedShareholder(null)
    }
  }

  // Format dữ liệu meetings để hiển thị trong Select
  const meetingOptions = meetings?.map((meeting: Meeting) => ({
    value: meeting.id,
    label: `${meeting.meetingName} - ${dayjs(meeting.meetingDate).format('DD/MM/YYYY HH:mm')}`
  })) || []

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
            label="Mã đại biểu"
            name="registrationCode"
          >
            <Input 
              placeholder="Mã tự động sinh" 
              disabled 
              addonAfter={
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => form.setFieldsValue({ registrationCode: generateRegistrationCode() })}
                >
                  Tạo mới
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            label="Cuộc họp"
            name="meetingId"
            rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
          >
            <Select 
              placeholder={isLoadingMeetings ? "Đang tải danh sách cuộc họp..." : "Chọn cuộc họp"}
              loading={isLoadingMeetings}
            >
              {meetingOptions.map((meeting: any) => (
                <Option key={meeting.value} value={meeting.value}>
                  {meeting.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Tìm cổ đông theo CCCD"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Search
              placeholder="Nhập số CCCD/CMND của cổ đông"
              value={idNumberInput}
              onChange={(e) => handleIdNumberSearch(e.target.value)}
              allowClear
              enterButton="Tìm"
              size="large"
            />
            
            {selectedShareholder ? (
              <Alert
                message="Đã tìm thấy cổ đông"
                description={`${selectedShareholder.fullName} - ${selectedShareholder.shareholderCode}`}
                type="success"
                showIcon
              />
            ) : idNumberInput && !selectedShareholder ? (
              <Alert
                message="Không tìm thấy cổ đông"
                description="Vui lòng kiểm tra lại số CCCD/CMND"
                type="warning"
                showIcon
              />
            ) : null}
          </Space>
        </Form.Item>

        {/* Ẩn trường shareholderId nhưng vẫn gửi đi */}
        <Form.Item name="shareholderId" hidden>
          <Input />
        </Form.Item>

        {/* Hiển thị thông tin cổ đông khi đã chọn */}
        {selectedShareholder && (
          <Card 
            title={
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span>Thông tin cổ đông</span>
              </div>
            }
            size="small"
            className="mb-4 border-green-200 bg-green-50"
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
                <strong>{selectedShareholder.fullName}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <IdcardOutlined />
                    <span>Mã cổ đông</span>
                  </div>
                }
              >
                <strong>{selectedShareholder.shareholderCode}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <IdcardOutlined />
                    <span>Số CCCD/CMND</span>
                  </div>
                }
              >
                {selectedShareholder.idNumber}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <MailOutlined />
                    <span>Email</span>
                  </div>
                }
              >
                {selectedShareholder.email}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <PhoneOutlined />
                    <span>Số điện thoại</span>
                  </div>
                }
              >
                {selectedShareholder.phoneNumber}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <BankOutlined />
                    <span>Ngân hàng</span>
                  </div>
                }
              >
                {selectedShareholder.bankName} - {selectedShareholder.bankAccount}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <div className="flex items-center gap-1">
                    <ShareAltOutlined />
                    <span>Tổng số cổ phần</span>
                  </div>
                }
                span={2}
              >
                <strong className="text-green-600">{selectedShareholder.totalShares?.toLocaleString() || 0} cổ phần</strong>
              </Descriptions.Item>
              
              
            </Descriptions>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Hình thức tham dự"
            name="registrationType"
            initialValue="IN_PERSON"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức tham dự' }]}
          >
            <Select onChange={handleRegistrationTypeChange}>
              <Option value="IN_PERSON">Trực tiếp</Option>
              <Option value="PROXY">Ủy quyền</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="PENDING"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
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
              max={selectedShareholder?.totalShares || 0}
              style={{ width: '100%' }}
              placeholder="Nhập số cổ phần"
              disabled={!!selectedProxy}
            />
          </Form.Item>
        </div>

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

            {!isLoadingProxies && availableProxies.length === 0 && (
              <Alert
                message="Không có ủy quyền nào khả dụng"
                description="Cổ đông này không có ủy quyền nào đã được duyệt và còn hiệu lực."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

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
            initialValue={dayjs()}
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
            disabled={
              !selectedShareholderId || 
              (registrationType === 'PROXY' && !selectedProxy)
            }
          >
            {!selectedShareholderId 
              ? 'Vui lòng chọn cổ đông' 
              : registrationType === 'PROXY' && !selectedProxy 
                ? 'Vui lòng chọn ủy quyền' 
                : 'Tạo đăng ký'
            }
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
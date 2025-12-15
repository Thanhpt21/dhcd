// src/components/admin/registration/RegistrationUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Alert, Descriptions, Card } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateRegistration } from '@/hooks/registration/useUpdateRegistration'
import { useProxiesByShareholder } from '@/hooks/proxy/useProxiesByShareholder'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import type { Registration, RegistrationType } from '@/types/registration.type'
import type { Proxy } from '@/types/proxy.type'
import type { Shareholder } from '@/types/shareholder.type'
import { useQueryClient } from '@tanstack/react-query'
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

interface RegistrationUpdateModalProps {
  open: boolean
  onClose: () => void
  registration: Registration | null
  refetch?: () => void
}

export const RegistrationUpdateModal = ({
  open,
  onClose,
  registration,
  refetch,
}: RegistrationUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateRegistration()
  const queryClient = useQueryClient()
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null)
  const [selectedProxyId, setSelectedProxyId] = useState<number | null>(null)
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null)

  // Lấy danh sách cổ đông
  const { data: shareholders } = useAllShareholders()

  // Sử dụng Form.useWatch để theo dõi registrationType
  const registrationType = Form.useWatch('registrationType', form)

  // Lấy danh sách proxies theo shareholder
  const { data: proxies, isLoading: isLoadingProxies } = useProxiesByShareholder(
    registration?.shareholderId || 0
  )

  useEffect(() => {
    if (registration && open && shareholders) {
      const initialValues = {
        ...registration,
        registrationDate: registration.registrationDate ? dayjs(registration.registrationDate) : null,
        checkinTime: registration.checkinTime ? dayjs(registration.checkinTime) : null,
        // Nếu là đăng ký cũ không có registrationType, mặc định là IN_PERSON
        registrationType: registration.registrationType || 'IN_PERSON'
      }

      // Tìm cổ đông từ danh sách shareholders
      const shareholder = shareholders.find((sh: Shareholder) => 
        sh.id === registration.shareholderId
      )
      setSelectedShareholder(shareholder || null)

      // Nếu là đăng ký ủy quyền, tìm proxy tương ứng từ danh sách proxies
      if ((registration.registrationType === 'PROXY' || !registration.registrationType) 
          && registration.proxyName && proxies) {
        
        const matchingProxy = proxies.find((proxy: Proxy) => 
          proxy.proxyPerson?.fullName === registration.proxyName
        )
        
        if (matchingProxy) {
          setSelectedProxy(matchingProxy)
          setSelectedProxyId(matchingProxy.id)
        } else {
          // Nếu không tìm thấy proxy matching, vẫn giữ thông tin proxy cũ
          setSelectedProxy({
            id: 0,
            proxyPerson: {
              fullName: registration.proxyName,
              idNumber: registration.proxyIdNumber,
              email: '',
              shareholderCode: '',
              phone: ''
            },
            shares: registration.sharesRegistered,
            documentUrl: registration.proxyDocumentUrl,
            endDate: dayjs().add(1, 'year').toISOString()
          } as Proxy)
          setSelectedProxyId(0)
        }
      }

      form.setFieldsValue(initialValues)
    }
  }, [registration, open, form, proxies, shareholders])

  const onFinish = async (values: any) => {
    if (!registration) return
    
    try {
      const payload = {
        ...values,
        registrationDate: values.registrationDate?.toISOString(),
        checkinTime: values.checkinTime?.toISOString(),
        // Nếu là ủy quyền và có chọn proxy mới, sử dụng thông tin từ proxy
        ...(values.registrationType === 'PROXY' && selectedProxy && selectedProxyId !== 0 && {
          proxyName: selectedProxy.proxyPerson?.fullName,
          proxyIdNumber: selectedProxy.proxyPerson?.idNumber,
          proxyRelationship: 'Được ủy quyền',
          proxyDocumentUrl: selectedProxy.documentUrl,
          sharesRegistered: selectedProxy.shares
        }),
        // Nếu là proxy nhưng không có proxy được chọn (giữ nguyên thông tin cũ)
        ...(values.registrationType === 'PROXY' && (!selectedProxy || selectedProxyId === 0) && {
          proxyName: registration.proxyName,
          proxyIdNumber: registration.proxyIdNumber,
          proxyRelationship: registration.proxyRelationship,
          proxyDocumentUrl: registration.proxyDocumentUrl,
          sharesRegistered: values.sharesRegistered
        })
      }

      // Xóa trường checkinMethod nếu có
      delete payload.checkinMethod

      console.log("📤 Payload gửi đi:", payload)

      await mutateAsync({
        id: registration.id,
        data: payload,
      })
      
      message.success('Cập nhật đăng ký thành công')
      await queryClient.invalidateQueries({ 
        queryKey: ['registrations'] 
      })
      onClose()
      form.resetFields()
      setSelectedProxy(null)
      setSelectedProxyId(null)
      setSelectedShareholder(null)
      refetch?.()
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật đăng ký:", error)
      message.error(error?.response?.data?.message || 'Lỗi cập nhật đăng ký')
    }
  }

  // Lọc chỉ lấy ủy quyền còn hiệu lực và đã được duyệt
  const availableProxies = proxies?.filter((proxy: Proxy) => 
    proxy.status === 'APPROVED' && 
    dayjs().isBefore(dayjs(proxy.endDate))
  ) || []

  // Khi hình thức tham dự thay đổi
  const handleRegistrationTypeChange = (type: RegistrationType) => {
    if (type !== 'PROXY') {
      setSelectedProxy(null)
      setSelectedProxyId(null)
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
    setSelectedProxyId(proxyId)
    
    if (proxy) {
      form.setFieldsValue({
        sharesRegistered: proxy.shares,
        proxyName: proxy.proxyPerson?.fullName,
        proxyIdNumber: proxy.proxyPerson?.idNumber,
        proxyRelationship: 'Được ủy quyền',
        proxyDocumentUrl: proxy.documentUrl
      })
    } else {
      // Khi xóa chọn proxy, reset về thông tin cũ (nếu có)
      if (registration?.registrationType === 'PROXY' || registration?.proxyName) {
        form.setFieldsValue({
          proxyName: registration?.proxyName,
          proxyIdNumber: registration?.proxyIdNumber,
          proxyRelationship: registration?.proxyRelationship,
          proxyDocumentUrl: registration?.proxyDocumentUrl,
          sharesRegistered: registration?.sharesRegistered
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
  }

  // Kiểm tra xem có phải đang sử dụng proxy cũ không
  const isUsingExistingProxy = selectedProxyId === 0

  return (
    <Modal
      title="Cập nhật thông tin đăng ký"
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
          >
            <Input 
              value={registration?.registrationCode || ''} 
              disabled 
            />
          </Form.Item>

          <Form.Item
            label="Hình thức tham dự"
            name="registrationType"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức tham dự' }]}
          >
            <Select onChange={handleRegistrationTypeChange}>
              <Option value="IN_PERSON">Trực tiếp</Option>
              <Option value="PROXY">Ủy quyền</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Hiển thị thông tin cổ đông */}
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

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Trạng thái"
            name="status"
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
          >
            <InputNumber 
              min={0}
              max={selectedShareholder?.totalShares || 0}
              style={{ width: '100%' }}
              placeholder="Nhập số cổ phần"
              disabled={!!selectedProxy && !isUsingExistingProxy}
            />
          </Form.Item>
        </div>

        {/* Hiển thị phần chọn ủy quyền khi hình thức là PROXY */}
        {registrationType === 'PROXY' && registration?.shareholderId && (
          <>
            <Form.Item label="Chọn ủy quyền">
              <Select 
                placeholder={isLoadingProxies ? "Đang tải ủy quyền..." : "Chọn ủy quyền"}
                onChange={handleProxyChange}
                allowClear
                loading={isLoadingProxies}
                value={selectedProxyId || undefined}
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

            {/* Hiển thị thông tin người được ủy quyền khi chọn proxy MỚI */}
            {selectedProxy && !isUsingExistingProxy && (
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

            {/* Thông báo khi đang sử dụng proxy cũ */}
            {isUsingExistingProxy && (
              <Alert
                message="Đang sử dụng thông tin ủy quyền cũ"
                description={
                  <div>
                    <p>Thông tin ủy quyền này được lưu từ trước:</p>
                    <ul className="mt-2 ml-4 list-disc">
                      <li>Người được ủy quyền: <strong>{registration?.proxyName}</strong></li>
                      <li>Số CMND/CCCD: <strong>{registration?.proxyIdNumber}</strong></li>
                      <li>Số cổ phần: <strong>{registration?.sharesRegistered?.toLocaleString()}</strong></li>
                    </ul>
                    <p className="mt-2">Bạn có thể chọn ủy quyền mới từ danh sách trên.</p>
                  </div>
                }
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            {/* Hidden fields để lưu thông tin ủy quyền */}
            <Form.Item name="proxyName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="proxyIdNumber" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="proxyRelationship" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="proxyDocumentUrl" hidden>
              <Input />
            </Form.Item>
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
              : 'Cập nhật đăng ký'
            }
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
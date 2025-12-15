// src/components/admin/meeting/MeetingCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, DatePicker, InputNumber, Select, Alert } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateMeeting } from '@/hooks/meeting/useCreateMeeting'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface MeetingCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const MeetingCreateModal = ({
  open,
  onClose,
  refetch,
}: MeetingCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateMeeting()
  const [meetingType, setMeetingType] = useState<string>('') // State theo dõi loại cuộc họp

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        meetingDate: values.meetingDate?.toISOString(),
        registrationStart: values.registrationStart?.toISOString(),
        registrationEnd: values.registrationEnd?.toISOString(),
        votingStart: values.votingStart?.toISOString(),
        votingEnd: values.votingEnd?.toISOString(),
        totalShares: meetingType === 'AGM' ? (values.totalShares || 0) : 0,
        totalShareholders: meetingType === 'AGM' ? (values.totalShareholders || 0) : 0,
        participantCount: meetingType === 'BOARD' ? (values.participantCount || 0) : 0,
        createdBy: 1,
      }
      await mutateAsync(payload)
      message.success('Tạo cuộc họp thành công')
      onClose()
      form.resetFields()
      setMeetingType('')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo cuộc họp')
    }
  }

  // Xử lý khi thay đổi loại cuộc họp
  const handleMeetingTypeChange = (value: string) => {
    setMeetingType(value)
    
    // Reset các field liên quan khi đổi loại cuộc họp
    if (value === 'AGM') {
      form.setFieldsValue({
        participantCount: 0,
        totalShares: 0,
        totalShareholders: 0
      })
    } else if (value === 'BOARD') {
      form.setFieldsValue({
        totalShares: 0,
        totalShareholders: 0,
        participantCount: 0
      })
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setMeetingType('')
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo cuộc họp mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã cuộc họp"
            name="meetingCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã cuộc họp' },
              { 
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  // Kiểm tra có chứa ký tự đặc biệt không mong muốn
                  const invalidChars = /[<>'"`|\\\/;:]/;
                  if (invalidChars.test(value)) {
                    return Promise.reject(new Error('Mã cuộc họp không được chứa ký tự đặc biệt: <> \' " ` | \\ / ; :'));
                  }
                  
                  // Kiểm tra định dạng cơ bản
                  const parts = value.split('_');
                  if (parts.length < 2) {
                    return Promise.reject(new Error('Mã cuộc họp nên có định dạng: TÊNKH_LOAIHOP_THOIGIAN'));
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
            help={
              <div className="mt-1 text-xs text-gray-500">
                <div className="flex items-start gap-1">
                  <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                  <span>Định dạng chuẩn: [Tên khách hàng]_[Loại cuộc họp]_[Thời gian]</span>
                </div>
                <div className="ml-5 mt-0.5">
                  <div className="text-gray-400">Ví dụ (có thể dùng tiếng Việt):</div>
                  <ul className="list-disc pl-4 text-gray-400 space-y-0.5">
                    <li>CII_ĐHĐCĐ_01.25</li>
                    <li>VIC_HĐQT_Q2.24</li>
                  </ul>
                </div>
              </div>
            }
          >
            <Input placeholder="VD: CII_ĐHĐCĐ_01.25" />
          </Form.Item>

          <Form.Item
            label="Loại cuộc họp"
            name="meetingType"
            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc họp' }]}
          >
            <Select 
              placeholder="Chọn loại cuộc họp"
              onChange={handleMeetingTypeChange}
            >
              <Option value="AGM">Đại hội đồng cổ đông</Option>
              <Option value="BOARD">Họp hội đồng quản trị</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="mb-4">
          <Alert
            message="Hướng dẫn đặt mã cuộc họp"
            description={
              <div className="space-y-2">
                <div>
                  <strong>Quy tắc đặt tên:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li><strong>[Tên khách hàng]</strong>: Viết tắt của công ty (VD: CII, VIC, ACB)</li>
                    <li><strong>[Loại cuộc họp]</strong>: 
                      <ul className="list-circle pl-4 mt-1">
                        <li><code>ĐHĐCĐ</code> - Đại hội đồng cổ đông</li>
                        <li><code>HĐQT</code> - Họp hội đồng quản trị</li>
                      </ul>
                    </li>
                    <li><strong>[Thời gian]</strong>: 
                      <ul className="list-circle pl-4 mt-1">
                        <li>Tháng.Năm (VD: 01.25 cho tháng 1/2025)</li>
                        <li>Quý.Năm (VD: Q2.24 cho quý 2/2024)</li>
                        <li>BT.24 cho bất thường năm 2024</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Mẫu tham khảo:</strong>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-sm">
                      <div className="font-mono">CII_ĐHĐCĐ_01.25</div>
                      <div className="text-gray-500 text-xs">CII - ĐHĐCĐ - Tháng 1/2025</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-mono">VIC_HĐQT_Q2.24</div>
                      <div className="text-gray-500 text-xs">VIC - Họp HĐQT - Quý 2/2024</div>
                    </div>
                  </div>
                </div>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />
        </div>

        <Form.Item
          label="Tên cuộc họp"
          name="meetingName"
          rules={[
            { required: true, message: 'Vui lòng nhập tên cuộc họp' },
            { min: 5, message: 'Tên cuộc họp phải có ít nhất 5 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên đầy đủ của cuộc họp" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả về cuộc họp (không bắt buộc)"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Ngày và giờ họp"
            name="meetingDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày họp' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>

          <Form.Item
            label="Địa điểm"
            name="meetingLocation"
          >
            <Input placeholder="Nhập địa điểm tổ chức" />
          </Form.Item>
        </div>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="meetingAddress"
        >
          <TextArea 
            rows={2} 
            placeholder="Nhập địa chỉ chi tiết (không bắt buộc)"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Bắt đầu đăng ký"
            name="registrationStart"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>

          <Form.Item
            label="Kết thúc đăng ký"
            name="registrationEnd"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Bắt đầu bỏ phiếu"
            name="votingStart"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>

          <Form.Item
            label="Kết thúc bỏ phiếu"
            name="votingEnd"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>
        </div>

        {/* Các field hiển thị theo loại cuộc họp */}
        {meetingType === 'AGM' ? (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Tổng số cổ phần"
              name="totalShares"
              initialValue={0}
              rules={[
                { 
                  type: 'number', 
                  min: 0, 
                  message: 'Tổng số cổ phần phải lớn hơn hoặc bằng 0' 
                }
              ]}
              help="Tổng số cổ phần phát hành"
            >
              <InputNumber 
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập tổng số cổ phần"
              />
            </Form.Item>

            <Form.Item
              label="Tổng số cổ đông"
              name="totalShareholders"
              initialValue={0}
              rules={[
                { 
                  type: 'number', 
                  min: 0, 
                  message: 'Tổng số cổ đông phải lớn hơn hoặc bằng 0' 
                }
              ]}
              help="Số lượng cổ đông tham dự"
            >
              <InputNumber 
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập tổng số cổ đông"
              />
            </Form.Item>
          </div>
        ) : meetingType === 'BOARD' ? (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Số lượng thành viên"
              name="participantCount"
              initialValue={0}
              rules={[
                { 
                  type: 'number', 
                  min: 1, 
                  message: 'Số lượng thành viên phải lớn hơn 0' 
                }
              ]}
              help="Tổng số thành viên HĐQT tham dự"
            >
              <InputNumber 
                min={1}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng thành viên"
              />
            </Form.Item>
            
            {/* Cột thứ 2 để giữ layout */}
            <div></div>
          </div>
        ) : (
          // Hiển thị khi chưa chọn loại cuộc họp
          <Alert
            message="Chọn loại cuộc họp để hiển thị các trường thông tin tương ứng"
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Thông báo giải thích */}
        {meetingType === 'AGM' && (
          <Alert
            message="Thông tin cho Đại hội đồng cổ đông"
            description="Vui lòng nhập thông tin về cổ phần và cổ đông. Số lượng thành viên không áp dụng cho loại cuộc họp này."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {meetingType === 'BOARD' && (
          <Alert
            message="Thông tin cho Họp Hội đồng quản trị"
            description="Vui lòng nhập số lượng thành viên HĐQT tham dự. Thông tin về cổ phần và cổ đông không áp dụng cho loại cuộc họp này."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
            disabled={!meetingType} // Disable nếu chưa chọn loại cuộc họp
          >
            Tạo cuộc họp
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
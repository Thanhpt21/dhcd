// src/components/admin/attendance/AttendanceCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, Alert, Empty, Tag } from 'antd'
import { useEffect } from 'react'
import { useCreateAttendance } from '@/hooks/attendance/useCreateAttendance'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
// 1. Nhập hook lấy đăng ký
import { useMeetingRegistrations } from '@/hooks/registration/useMeetingRegistrations'
import type { CheckinMethod } from '@/types/attendance.type'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface AttendanceCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const AttendanceCreateModal = ({
  open,
  onClose,
  refetch,
}: AttendanceCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateAttendance()
  const { data: meetings, isLoading: isLoadingMeetings } = useAllMeetings()

  // 2. Lấy giá trị meetingId từ form để làm phụ thuộc
  const selectedMeetingId = Form.useWatch('meetingId', form)
  
  // 3. Sử dụng hook lấy danh sách đăng ký với meetingId đã chọn
  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations,
    error: registrationError
  } = useMeetingRegistrations(selectedMeetingId ? selectedMeetingId : '')

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        meetingId: Number(values.meetingId),
        shareholderId: Number(values.shareholderId),
        checkinTime: values.checkinTime?.toISOString() || new Date().toISOString(),
        checkinMethod: values.checkinMethod || 'MANUAL',
      }
      
      console.log("📤 Payload gửi đi:", payload)
      
      await mutateAsync(payload)
      message.success('Tạo điểm danh thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      console.error("❌ Lỗi tạo điểm danh:", error)
      message.error(error?.response?.data?.message || 'Lỗi tạo điểm danh')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  // 4. Lọc chỉ lấy các đăng ký có trạng thái APPROVED
  const approvedRegistrations = registrations?.filter(
    (registration: any) => registration.status === 'APPROVED'
  ) || []

  // 5. Xử lý lỗi khi lấy danh sách đăng ký
  useEffect(() => {
    if (registrationError) {
      console.error('Lỗi khi lấy danh sách đăng ký:', registrationError)
      // message.error('Không thể tải danh sách cổ đông đã đăng ký')
    }
  }, [registrationError])

  return (
    <Modal
      title="Thêm điểm danh mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Cuộc họp"
          name="meetingId"
          rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
        >
          <Select 
            placeholder="Chọn cuộc họp"
            loading={isLoadingMeetings}
            onChange={() => {
              // 6. Reset lựa chọn cổ đông khi đổi cuộc họp
              form.setFieldValue('shareholderId', undefined)
            }}
          >
            {meetings?.map((meeting: any) => (
              <Option key={meeting.id} value={meeting.id}>
                {meeting.meetingName} ({dayjs(meeting.meetingDate).format('DD/MM/YYYY')})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Cổ đông"
          name="shareholderId"
          rules={[{ 
            required: true, 
            message: 'Vui lòng chọn cổ đông đã đăng ký' 
          }]}
          help={selectedMeetingId && approvedRegistrations.length === 0 ? 
            "Không có cổ đông nào đã đăng ký với trạng thái ĐÃ DUYỆT cho cuộc họp này" : 
            undefined
          }
        >
          <Select 
            placeholder={
              selectedMeetingId ? 
                "Chọn cổ đông đã đăng ký (ĐÃ DUYỆT)" : 
                "Vui lòng chọn cuộc họp trước"
            }
            loading={isLoadingRegistrations}
            disabled={!selectedMeetingId || isLoadingRegistrations}
            showSearch
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const optionText = String(option?.label || option?.children || '');
              return optionText.toLowerCase().includes(searchText);
            }}
            notFoundContent={
              selectedMeetingId ? (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    isLoadingRegistrations ? 
                      "Đang tải danh sách..." : 
                      "Không có cổ đông đã đăng ký"
                  } 
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="Vui lòng chọn cuộc họp trước" 
                />
              )
            }
          >
            {/* 7. Chỉ hiển thị cổ đông từ danh sách đăng ký APPROVED */}
            {approvedRegistrations?.map((registration: any) => {
              const shareholder = registration.shareholder
              return (
                <Option 
                  key={shareholder.id} 
                  value={shareholder.id}
                  label={`${shareholder.shareholderCode} - ${shareholder.fullName}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {shareholder.shareholderCode} - {shareholder.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Đã đăng ký: {registration.sharesRegistered.toLocaleString()} CP
                      </div>
                    </div>
                    <div className="text-xs">
                      <Tag color="green">ĐÃ DUYỆT</Tag>
                    </div>
                  </div>
                </Option>
              )
            })}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Thời gian check-in"
            name="checkinTime"
            initialValue={dayjs()}
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn thời gian check-in"
            />
          </Form.Item>

          <Form.Item
            label="Phương thức"
            name="checkinMethod"
            initialValue="MANUAL"
          >
            <Select placeholder="Chọn phương thức">
              <Option value="QR_CODE">QR Code</Option>
              <Option value="MANUAL">Thủ công</Option>
              <Option value="FACE_RECOGNITION">Nhận diện</Option>
            </Select>
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

        <Alert
          message="Thông tin điểm danh"
          description={
            selectedMeetingId ? 
              `Chỉ hiển thị cổ đông đã đăng ký với trạng thái "ĐÃ DUYỆT" cho cuộc họp này` : 
              "Điểm danh sẽ được tạo với thời gian hiện tại nếu không chọn thời gian cụ thể."
          }
          type="info"
          showIcon
          className="mb-4"
        />

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
            disabled={approvedRegistrations.length === 0}
          >
            {approvedRegistrations.length === 0 ? 
              "Không có cổ đông đã đăng ký" : 
              "Tạo điểm danh"
            }
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
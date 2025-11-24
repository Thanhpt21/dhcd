// src/components/admin/attendance/AttendanceCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, Alert } from 'antd'
import { useEffect } from 'react'
import { useCreateAttendance } from '@/hooks/attendance/useCreateAttendance'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
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
  const { data: shareholders } = useAllShareholders()
  const { data: meetings, isLoading: isLoadingMeetings } = useAllMeetings()

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
          rules={[{ required: true, message: 'Vui lòng chọn cổ đông' }]}
        >
          <Select 
            placeholder="Chọn cổ đông"
            showSearch
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
          label="Địa chỉ IP"
          name="ipAddress"
        >
          <Input placeholder="Nhập địa chỉ IP (tự động nếu để trống)" />
        </Form.Item>

        <Form.Item
          label="Thiết bị"
          name="userAgent"
        >
          <Input placeholder="Nhập thông tin thiết bị (tự động nếu để trống)" />
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

        <Alert
          message="Thông tin điểm danh"
          description="Điểm danh sẽ được tạo với thời gian hiện tại nếu không chọn thời gian cụ thể."
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
          >
            Tạo điểm danh
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
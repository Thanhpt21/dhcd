// src/components/admin/attendance/AttendanceUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker } from 'antd'
import { useEffect } from 'react'
import { useUpdateAttendance } from '@/hooks/attendance/useUpdateAttendance'
import type { Attendance } from '@/types/attendance.type'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'

const { Option } = Select
const { TextArea } = Input

interface AttendanceUpdateModalProps {
  open: boolean
  onClose: () => void
  attendance: Attendance | null
  refetch?: () => void
}

export const AttendanceUpdateModal = ({
  open,
  onClose,
  attendance,
  refetch,
}: AttendanceUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateAttendance()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (attendance && open) {
      const initialValues = {
        ...attendance,
        checkinTime: attendance.checkinTime ? dayjs(attendance.checkinTime) : null,
        checkoutTime: attendance.checkoutTime ? dayjs(attendance.checkoutTime) : null,
      }
      form.setFieldsValue(initialValues)
    }
  }, [attendance, open, form])

  const onFinish = async (values: any) => {
    if (!attendance) return
    
    try {
      const payload = {
        ...values,
        checkinTime: values.checkinTime?.toISOString(),
        checkoutTime: values.checkoutTime?.toISOString(),
      }

      console.log("📤 Payload gửi đi:", payload)

      await mutateAsync({
        id: attendance.id,
        data: payload,
      })
      message.success('Cập nhật điểm danh thành công')
      await queryClient.invalidateQueries({ 
        queryKey: ['attendances'] 
      })
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật điểm danh')
    }
  }

  return (
    <Modal
      title="Cập nhật thông tin điểm danh"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Thời gian check-in"
            name="checkinTime"
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn thời gian check-in"
            />
          </Form.Item>

          <Form.Item
            label="Thời gian check-out"
            name="checkoutTime"
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn thời gian check-out"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Phương thức"
          name="checkinMethod"
        >
          <Select placeholder="Chọn phương thức">
            <Option value="QR_CODE">QR Code</Option>
            <Option value="MANUAL">Thủ công</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Địa chỉ IP"
          name="ipAddress"
        >
          <Input placeholder="Nhập địa chỉ IP" />
        </Form.Item>

        <Form.Item
          label="Thiết bị"
          name="userAgent"
        >
          <Input placeholder="Nhập thông tin thiết bị" />
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
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
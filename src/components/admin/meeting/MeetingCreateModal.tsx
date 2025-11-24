// src/components/admin/meeting/MeetingCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, DatePicker, InputNumber, Select } from 'antd'
import { useEffect } from 'react'
import { useCreateMeeting } from '@/hooks/meeting/useCreateMeeting'
import dayjs from 'dayjs'

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

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        meetingDate: values.meetingDate?.toISOString(),
        registrationStart: values.registrationStart?.toISOString(),
        registrationEnd: values.registrationEnd?.toISOString(),
        votingStart: values.votingStart?.toISOString(),
        votingEnd: values.votingEnd?.toISOString(),
        createdBy: 1, // TODO: Get from auth context
      }
      await mutateAsync(payload)
      message.success('Tạo cuộc họp thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo cuộc họp')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
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
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: MTG-2024-001" />
          </Form.Item>

          <Form.Item
            label="Loại cuộc họp"
            name="meetingType"
            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc họp' }]}
          >
            <Select placeholder="Chọn loại cuộc họp">
              <Option value="AGM">Đại hội đồng cổ đông thường niên</Option>
              <Option value="EGM">Đại hội đồng cổ đông bất thường</Option>
              <Option value="BOARD">Họp hội đồng quản trị</Option>
              <Option value="SHAREHOLDER">Họp cổ đông</Option>
            </Select>
          </Form.Item>
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

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tổng số cổ phần"
            name="totalShares"
            initialValue={0}
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
          >
            <InputNumber 
              min={0}
              style={{ width: '100%' }}
              placeholder="Nhập tổng số cổ đông"
            />
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Tạo cuộc họp
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
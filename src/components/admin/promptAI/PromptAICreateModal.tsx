'use client'

import { Modal, Form, Input, Select, message, Button, InputNumber, DatePicker } from 'antd'
import { useEffect } from 'react'
import { useCreatePromptAI } from '@/hooks/promptAI/useCreatePromptAI' // Giả sử path hooks là này, điều chỉnh nếu cần
import dayjs from 'dayjs'

interface PromptAICreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const PromptAICreateModal = ({
  open,
  onClose,
  refetch,
}: PromptAICreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreatePromptAI()

  const onFinish = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        text: values.text,
        status: values.status,
        position: values.position,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      }
      await mutateAsync(payload)
      message.success('Tạo Prompt AI thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo Prompt AI')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo Prompt AI mới"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên Prompt AI"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên Prompt AI' },
            { min: 3, message: 'Tên phải có ít nhất 3 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên Prompt AI" />
        </Form.Item>

        <Form.Item
          label="Nội dung Prompt"
          name="text"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung prompt' }]}
        >
          <Input.TextArea placeholder="Nhập nội dung prompt" rows={4} />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          initialValue="ACTIVE"
        >
          <Select>
            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Tạm dừng</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Thứ tự"
          name="position"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
        >
          <InputNumber min={0} placeholder="Nhập thứ tự" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu"
          name="startDate"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Ngày kết thúc"
          name="endDate"
          rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
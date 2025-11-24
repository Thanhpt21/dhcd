'use client'

import { Modal, Form, Input, Select, message, Button, InputNumber, DatePicker } from 'antd'
import { useEffect } from 'react'
import { useUpdatePromptAI } from '@/hooks/promptAI/useUpdatePromptAI'
import dayjs from 'dayjs'

interface PromptAIUpdateModalProps {
  open: boolean
  onClose: () => void
  promptAI: any
  refetch?: () => void
}

export const PromptAIUpdateModal = ({
  open,
  onClose,
  promptAI,
  refetch,
}: PromptAIUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdatePromptAI()

  useEffect(() => {
    if (promptAI && open) {
      form.setFieldsValue({
        name: promptAI.name,
        text: promptAI.text,
        status: promptAI.status,
        position: promptAI.position,
        startDate: dayjs(promptAI.startDate),
        endDate: dayjs(promptAI.endDate),
      })
    }
  }, [promptAI, open, form])

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
      await mutateAsync({
        id: promptAI.id,
        data: payload,
      })
      message.success('Cập nhật Prompt AI thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật Prompt AI')
    }
  }

  return (
    <Modal
      title="Cập nhật Prompt AI"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
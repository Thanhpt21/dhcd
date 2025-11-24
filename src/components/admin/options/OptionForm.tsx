// src/components/admin/option/OptionForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateOption } from '@/hooks/option/useCreateOption'
import { useUpdateOption } from '@/hooks/option/useUpdateOption'
import type { ResolutionOption } from '@/types/option.type'

const { TextArea } = Input

interface OptionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  resolutionId: number
  option?: ResolutionOption | null
  isEdit?: boolean
}

export default function OptionForm({
  open,
  onClose,
  onSuccess,
  resolutionId,
  option,
  isEdit = false
}: OptionFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createOption, isPending: isCreating } = useCreateOption()
  const { mutateAsync: updateOption, isPending: isUpdating } = useUpdateOption()

  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (open && option) {
      form.setFieldsValue({
        ...option,
        resolutionId: option.resolutionId
      })
    } else if (open) {
      form.setFieldsValue({
        resolutionId,
        displayOrder: 1
      })
    }
  }, [open, option, resolutionId, form])

  const onFinish = async (values: any) => {
    try {
      if (isEdit && option) {
        await updateOption({
          id: option.id,
          ...values
        })
      } else {
        await createOption(values)
      }
      onSuccess()
      form.resetFields()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Cập nhật Phương án' : 'Thêm Phương án Bỏ phiếu'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          displayOrder: 1
        }}
      >
        <Form.Item name="resolutionId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã phương án"
            name="optionCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phương án' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: YES, NO, OPTION_A" />
          </Form.Item>

          <Form.Item
            label="Giá trị phương án"
            name="optionValue"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị phương án' },
            ]}
          >
            <Input placeholder="VD: YES, NO, option_a" />
          </Form.Item>
        </div>

        <Form.Item
          label="Tên hiển thị"
          name="optionText"
          rules={[
            { required: true, message: 'Vui lòng nhập tên hiển thị' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="VD: Đồng ý, Không đồng ý, Phương án A" />
        </Form.Item>

        <Form.Item
          label="Thứ tự hiển thị"
          name="displayOrder"
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="1"
          />
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả chi tiết về phương án bỏ phiếu"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            {isEdit ? 'Cập nhật' : 'Thêm'} Phương án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
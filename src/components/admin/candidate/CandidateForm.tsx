// src/components/admin/candidate/CandidateForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, Switch, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateCandidate } from '@/hooks/candidate/useCreateCandidate'
import { useUpdateCandidate } from '@/hooks/candidate/useUpdateCandidate'
import type { ResolutionCandidate } from '@/types/candidate.type'

const { TextArea } = Input

interface CandidateFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  resolutionId: number
  candidate?: ResolutionCandidate | null
  isEdit?: boolean
}

export default function CandidateForm({
  open,
  onClose,
  onSuccess,
  resolutionId,
  candidate,
  isEdit = false
}: CandidateFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createCandidate, isPending: isCreating } = useCreateCandidate()
  const { mutateAsync: updateCandidate, isPending: isUpdating } = useUpdateCandidate()

  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (open && candidate) {
      form.setFieldsValue({
        ...candidate,
        resolutionId: candidate.resolutionId
      })
    } else if (open) {
      form.setFieldsValue({
        resolutionId,
        displayOrder: 1,
        isElected: false
      })
    }
  }, [open, candidate, resolutionId, form])

  const onFinish = async (values: any) => {
    try {
      if (isEdit && candidate) {
        await updateCandidate({
          id: candidate.id,
          ...values
        })
      } else {
        await createCandidate(values)
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
      title={isEdit ? 'Cập nhật Ứng cử viên' : 'Thêm Ứng cử viên'}
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
          displayOrder: 1,
          isElected: false
        }}
      >
        <Form.Item name="resolutionId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã ứng cử viên"
            name="candidateCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã ứng cử viên' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: CAND-001" />
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
        </div>

        <Form.Item
          label="Tên ứng cử viên"
          name="candidateName"
          rules={[
            { required: true, message: 'Vui lòng nhập tên ứng cử viên' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Nhập họ tên đầy đủ của ứng cử viên" />
        </Form.Item>

        <Form.Item
          label="Thông tin bổ sung"
          name="candidateInfo"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập thông tin chi tiết về ứng cử viên (học vấn, kinh nghiệm, v.v.)"
          />
        </Form.Item>

        <Form.Item
          label="Đánh dấu trúng cử"
          name="isElected"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đã trúng cử" unCheckedChildren="Chưa trúng cử" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            {isEdit ? 'Cập nhật' : 'Thêm'} Ứng cử viên
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
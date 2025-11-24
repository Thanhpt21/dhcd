// src/components/admin/resolution/ResolutionForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, Select, Switch, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateResolution } from '@/hooks/resolution/useCreateResolution'
import { useUpdateResolution } from '@/hooks/resolution/useUpdateResolution'
import type { Resolution, ResolutionType } from '@/types/resolution.type'
import { VotingMethod } from '@/types/resolution.type' // Import value, not type

const { Option } = Select
const { TextArea } = Input

interface ResolutionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  meetingId: number
  resolution?: Resolution | null
  isEdit?: boolean
}

export default function ResolutionForm({
  open,
  onClose,
  onSuccess,
  meetingId,
  resolution,
  isEdit = false
}: ResolutionFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createResolution, isPending: isCreating } = useCreateResolution()
  const { mutateAsync: updateResolution, isPending: isUpdating } = useUpdateResolution()

  const isPending = isCreating || isUpdating

  const votingMethods = [
    { value: VotingMethod.YES_NO, label: 'Bỏ phiếu Có/Không' },
    { value: VotingMethod.MULTIPLE_CHOICE, label: 'Nhiều lựa chọn' },
    { value: VotingMethod.RANKING, label: 'Xếp hạng' },
  ]

  const resolutionTypes = [
    { value: 'ELECTION', label: 'Bầu cử' },
    { value: 'APPROVAL', label: 'Phê duyệt' },
    { value: 'POLICY', label: 'Chính sách' },
    { value: 'OTHER', label: 'Khác' },
  ]

  useEffect(() => {
    if (open && resolution) {
      form.setFieldsValue({
        ...resolution,
        meetingId: resolution.meetingId
      })
    } else if (open) {
      form.setFieldsValue({
        meetingId,
        votingMethod: VotingMethod.YES_NO,
        approvalThreshold: 50,
        maxChoices: 1,
        displayOrder: 0,
        isActive: true
      })
    }
  }, [open, resolution, meetingId, form])

  const onFinish = async (values: any) => {
    try {
      if (isEdit && resolution) {
        await updateResolution({
          id: resolution.id,
          ...values
        })
      } else {
        await createResolution(values)
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
      title={isEdit ? 'Cập nhật Nghị quyết' : 'Tạo Nghị quyết'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          votingMethod: VotingMethod.YES_NO,
          approvalThreshold: 50,
          maxChoices: 1,
          displayOrder: 0,
          isActive: true
        }}
      >
        <Form.Item name="meetingId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã nghị quyết"
            name="resolutionCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã nghị quyết' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: RES-001" />
          </Form.Item>

          <Form.Item
            label="Số nghị quyết"
            name="resolutionNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số nghị quyết' }]}
          >
            <InputNumber 
              min={1}
              style={{ width: '100%' }}
              placeholder="Số thứ tự"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Tiêu đề nghị quyết"
          name="title"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tiêu đề đầy đủ của nghị quyết" />
        </Form.Item>

        <Form.Item
          label="Nội dung chi tiết"
          name="content"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập nội dung đầy đủ của nghị quyết"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Loại nghị quyết"
            name="resolutionType"
            rules={[{ required: true, message: 'Vui lòng chọn loại nghị quyết' }]}
          >
            <Select placeholder="Chọn loại nghị quyết">
              {resolutionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phương thức bỏ phiếu"
            name="votingMethod"
          >
            <Select placeholder="Chọn phương thức bỏ phiếu">
              {votingMethods.map(method => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Ngưỡng chấp thuận (%)"
            name="approvalThreshold"
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="50"
            />
          </Form.Item>

          <Form.Item
            label="Số lựa chọn tối đa"
            name="maxChoices"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="1"
            />
          </Form.Item>

          <Form.Item
            label="Thứ tự hiển thị"
            name="displayOrder"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Trạng thái"
          name="isActive"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            {isEdit ? 'Cập nhật' : 'Tạo'} Nghị quyết
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
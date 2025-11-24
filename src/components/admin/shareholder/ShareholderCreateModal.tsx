// src/components/admin/shareholder/ShareholderCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Switch } from 'antd'
import { useEffect } from 'react'
import { useCreateShareholder } from '@/hooks/shareholder/useCreateShareholder'
import type { Gender, ShareType } from '@/types/shareholder.type'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface ShareholderCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const ShareholderCreateModal = ({
  open,
  onClose,
  refetch,
}: ShareholderCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateShareholder()

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        idIssueDate: values.idIssueDate?.toISOString(),
        dateOfBirth: values.dateOfBirth?.toISOString(),
        totalShares: values.totalShares || 0,
        isActive: values.isActive !== false,
      }
      await mutateAsync(payload)
      message.success('Tạo cổ đông thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo cổ đông')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Thêm cổ đông mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã cổ đông"
            name="shareholderCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã cổ đông' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: SH-2024-001" />
          </Form.Item>

          <Form.Item
            label="Loại cổ phần"
            name="shareType"
            initialValue="COMMON"
          >
            <Select>
              <Option value="COMMON">Cổ phần phổ thông</Option>
              <Option value="PREFERRED">Cổ phần ưu đãi</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Nhập họ và tên đầy đủ" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Số CMND/CCCD"
            name="idNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
              { pattern: /^[0-9]+$/, message: 'Số CMND/CCCD chỉ được chứa số' },
            ]}
          >
            <Input placeholder="Nhập số CMND hoặc CCCD" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Ngày cấp CMND/CCCD"
            name="idIssueDate"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày cấp"
            />
          </Form.Item>

          <Form.Item
            label="Nơi cấp"
            name="idIssuePlace"
          >
            <Input placeholder="Nơi cấp CMND/CCCD" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Giới tính"
            name="gender"
          >
            <Select placeholder="Chọn giới tính">
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Quốc tịch"
            name="nationality"
            initialValue="Việt Nam"
          >
            <Input placeholder="Quốc tịch" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
        </div>

        <Form.Item
          label="Địa chỉ"
          name="address"
        >
          <TextArea 
            rows={2} 
            placeholder="Nhập địa chỉ liên hệ"
          />
        </Form.Item>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Mã số thuế"
            name="taxCode"
          >
            <Input placeholder="Mã số thuế" />
          </Form.Item>

          <Form.Item
            label="Số tài khoản ngân hàng"
            name="bankAccount"
          >
            <Input placeholder="Số tài khoản" />
          </Form.Item>

          <Form.Item
            label="Tên ngân hàng"
            name="bankName"
          >
            <Input placeholder="Tên ngân hàng" />
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
              placeholder="Nhập số cổ phần"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Tạo cổ đông
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
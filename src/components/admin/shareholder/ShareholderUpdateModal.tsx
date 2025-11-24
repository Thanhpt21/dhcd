// src/components/admin/shareholder/ShareholderUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Switch } from 'antd'
import { useEffect } from 'react'
import { useUpdateShareholder } from '@/hooks/shareholder/useUpdateShareholder'
import type { Shareholder } from '@/types/shareholder.type'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface ShareholderUpdateModalProps {
  open: boolean
  onClose: () => void
  shareholder: Shareholder | null
  refetch?: () => void
}

export const ShareholderUpdateModal = ({
  open,
  onClose,
  shareholder,
  refetch,
}: ShareholderUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateShareholder()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (shareholder && open) {
      form.setFieldsValue({
        ...shareholder,
        idIssueDate: shareholder.idIssueDate ? dayjs(shareholder.idIssueDate) : null,
        dateOfBirth: shareholder.dateOfBirth ? dayjs(shareholder.dateOfBirth) : null,
      })
    }
  }, [shareholder, open, form])

  const onFinish = async (values: any) => {
    if (!shareholder) return
    
    try {
      const payload = {
        ...values,
        idIssueDate: values.idIssueDate?.toISOString(),
        dateOfBirth: values.dateOfBirth?.toISOString(),
      }
      await mutateAsync({
        id: shareholder.id,
        data: payload,
      })
      message.success('Cập nhật cổ đông thành công')
      await queryClient.invalidateQueries({ 
        queryKey: ['shareholderHistory', shareholder.id] 
      })
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật cổ đông')
    }
  }

  return (
    <Modal
      title="Cập nhật thông tin cổ đông"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
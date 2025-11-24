// src/components/admin/verification/VerificationLinkCreateModal.tsx
'use client'

import { Modal, Form, Input, Select, DatePicker, Button, message, Row, Col } from 'antd'
import { useEffect } from 'react'
import { useCreateVerificationLink } from '@/hooks/verification/useCreateVerificationLink'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import dayjs from 'dayjs'

const { Option } = Select

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export function VerificationLinkCreateModal({ open, onClose, refetch }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: createVerificationLink, isPending } = useCreateVerificationLink()
  
  const { data: meetings } = useAllMeetings()
  const { data: shareholders } = useAllShareholders()

  useEffect(() => {
    if (open) {
      form.resetFields()
      // Generate random verification code
      form.setFieldValue('verificationCode', generateVerificationCode())
      form.setFieldValue('expiresAt', dayjs().add(24, 'hour'))
      form.setFieldValue('verificationType', 'REGISTRATION')
    }
  }, [open, form])

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleGenerateCode = () => {
    form.setFieldValue('verificationCode', generateVerificationCode())
  }

  const handleSubmit = async (values: any) => {
    try {
      await createVerificationLink({
        ...values,
        expiresAt: values.expiresAt.toISOString(),
      })
      message.success('Tạo link xác thực thành công')
      refetch?.()
      onClose()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạo link thất bại')
    }
  }

  return (
    <Modal
      title="Tạo Link Xác Thực Mới"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="meetingId"
              label="Cuộc họp"
              rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
            >
              <Select placeholder="Chọn cuộc họp" showSearch optionFilterProp="label">
                {meetings?.map((meeting: any) => (
                  <Option key={meeting.id} value={meeting.id} label={meeting.meetingName}>
                    {meeting.meetingName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shareholderId"
              label="Cổ đông"
              rules={[{ required: true, message: 'Vui lòng chọn cổ đông' }]}
            >
              <Select placeholder="Chọn cổ đông" showSearch optionFilterProp="label">
                {shareholders?.map((shareholder: any) => (
                  <Option key={shareholder.id} value={shareholder.id} label={shareholder.fullName}>
                    {shareholder.fullName} ({shareholder.shareholderCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="verificationCode"
              label="Mã xác thực"
              rules={[{ required: true, message: 'Vui lòng nhập mã xác thực' }]}
            >
              <Input 
                placeholder="Mã xác thực" 
                addonAfter={
                  <Button type="link" size="small" onClick={handleGenerateCode}>
                    Tạo mã
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="verificationType"
              label="Loại xác thực"
              rules={[{ required: true, message: 'Vui lòng chọn loại xác thực' }]}
            >
              <Select placeholder="Chọn loại xác thực">
                <Option value="REGISTRATION">Đăng ký</Option>
                <Option value="ATTENDANCE">Điểm danh</Option>
                <Option value="VOTING">Bỏ phiếu</Option>
                <Option value="DOCUMENT_ACCESS">Tài liệu</Option>
                <Option value="LIVESTREAM_ACCESS">Livestream</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="expiresAt"
          label="Thời hạn"
          rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
        >
          <DatePicker 
            showTime 
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Chọn thời hạn"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo Link
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
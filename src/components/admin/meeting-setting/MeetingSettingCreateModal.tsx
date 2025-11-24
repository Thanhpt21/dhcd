// src/components/admin/meeting-setting/MeetingSettingCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, Switch } from 'antd'
import { useEffect } from 'react'
import { useCreateMeetingSetting } from '@/hooks/meeting-setting/useCreateMeetingSetting'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import type { DataType } from '@/types/meeting-setting.type'

const { Option } = Select
const { TextArea } = Input

interface MeetingSettingCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const MeetingSettingCreateModal = ({
  open,
  onClose,
  refetch,
}: MeetingSettingCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateMeetingSetting()
  
  // Lấy danh sách tất cả meetings để làm options
  const { data: meetingsData, isLoading: isLoadingMeetings } = useAllMeetings()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo cài đặt thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo cài đặt')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Thêm cài đặt mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Cuộc họp"
            name="meetingId"
            rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
          >
            <Select
              placeholder="Chọn cuộc họp"
              loading={isLoadingMeetings}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const label = String(option?.label ?? '').toLowerCase()
                return label.includes(input.toLowerCase())
              }}
            >
              {meetingsData?.map((meeting: any) => (
                <Option 
                  key={meeting.id} 
                  value={meeting.id}
                  label={`${meeting.meetingCode} - ${meeting.meetingName}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{meeting.meetingCode}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {meeting.meetingName}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Kiểu dữ liệu"
            name="dataType"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Option value="STRING">Chuỗi</Option>
              <Option value="NUMBER">Số</Option>
              <Option value="BOOLEAN">Boolean</Option>
              <Option value="JSON">JSON</Option>
              <Option value="DATE">Ngày</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Khóa"
          name="key"
          rules={[
            { required: true, message: 'Vui lòng nhập khóa' },
            { pattern: /^[A-Z0-9_]+$/, message: 'Khóa chỉ được chứa chữ hoa, số và _' },
          ]}
        >
          <Input placeholder="Vui lòng nhập khóa" />
        </Form.Item>

        <Form.Item
          label="Giá trị"
          name="value"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
        >
          <Input placeholder="Nhập giá trị cài đặt" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả cài đặt (không bắt buộc)"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Tạo cài đặt
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
// src/components/admin/meeting-setting/MeetingSettingUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, Switch } from 'antd'
import { useEffect } from 'react'
import { useUpdateMeetingSetting } from '@/hooks/meeting-setting/useUpdateMeetingSetting'
import type { MeetingSetting } from '@/types/meeting-setting.type'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'

const { Option } = Select
const { TextArea } = Input

interface MeetingSettingUpdateModalProps {
  open: boolean
  onClose: () => void
  setting: MeetingSetting | null
  refetch?: () => void
}

export const MeetingSettingUpdateModal = ({
  open,
  onClose,
  setting,
  refetch,
}: MeetingSettingUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateMeetingSetting()
  const { data: meetingsData, isLoading: isLoadingMeetings } = useAllMeetings()

  useEffect(() => {
    if (setting && open) {
      form.setFieldsValue({
        ...setting,
      })
    }
  }, [setting, open, form])

  const onFinish = async (values: any) => {
    if (!setting) return
    
    try {
      await mutateAsync({
        id: setting.id,
        data: values,
      })
      message.success('Cập nhật cài đặt thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật cài đặt')
    }
  }

  return (
    <Modal
      title="Cập nhật cài đặt"
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
          >
            <Select
              placeholder="Chọn cuộc họp"
              loading={isLoadingMeetings}
              disabled // Không cho phép thay đổi meeting sau khi tạo
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
          <Input placeholder="VD: ALLOW_ONLINE_VOTING" />
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
            placeholder="Nhập mô tả cài đặt"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
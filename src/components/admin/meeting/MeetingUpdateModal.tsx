// src/components/admin/meeting/MeetingUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, DatePicker, InputNumber, Select, Alert } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateMeeting } from '@/hooks/meeting/useUpdateMeeting'
import dayjs from 'dayjs'
import type { Meeting } from '@/types/meeting.type'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface MeetingUpdateModalProps {
  open: boolean
  onClose: () => void
  meeting: Meeting | null
  refetch?: () => void
}

export const MeetingUpdateModal = ({
  open,
  onClose,
  meeting,
  refetch,
}: MeetingUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateMeeting()
  const [meetingType, setMeetingType] = useState<string>('')

  useEffect(() => {
    if (meeting && open) {
      const formValues = {
        ...meeting,
        meetingDate: meeting.meetingDate ? dayjs(meeting.meetingDate) : null,
        registrationStart: meeting.registrationStart ? dayjs(meeting.registrationStart) : null,
        registrationEnd: meeting.registrationEnd ? dayjs(meeting.registrationEnd) : null,
        votingStart: meeting.votingStart ? dayjs(meeting.votingStart) : null,
        votingEnd: meeting.votingEnd ? dayjs(meeting.votingEnd) : null,
        participantCount: meeting.participantCount || 0,
      }
      form.setFieldsValue(formValues)
      setMeetingType(meeting.meetingType)
    }
  }, [meeting, open, form])

  const onFinish = async (values: any) => {
    if (!meeting) return
    
    try {
      const payload = {
        ...values,
        meetingDate: values.meetingDate?.toISOString(),
        registrationStart: values.registrationStart?.toISOString(),
        registrationEnd: values.registrationEnd?.toISOString(),
        votingStart: values.votingStart?.toISOString(),
        votingEnd: values.votingEnd?.toISOString(),
        // Xử lý các field theo loại cuộc họp
        totalShares: meetingType === 'AGM' ? (values.totalShares || 0) : 0,
        totalShareholders: meetingType === 'AGM' ? (values.totalShareholders || 0) : 0,
        participantCount: meetingType === 'BOARD' ? (values.participantCount || 0) : 0,
      }
      await mutateAsync({
        id: meeting.id,
        data: payload,
      })
      message.success('Cập nhật cuộc họp thành công')
      onClose()
      form.resetFields()
      setMeetingType('')
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật cuộc họp')
    }
  }

  // Xử lý khi thay đổi loại cuộc họp
  const handleMeetingTypeChange = (value: string) => {
    setMeetingType(value)
    
    // Reset các field liên quan khi đổi loại cuộc họp
    if (value === 'AGM') {
      form.setFieldsValue({
        participantCount: 0,
        totalShares: meeting?.totalShares || 0,
        totalShareholders: meeting?.totalShareholders || 0
      })
    } else if (value === 'BOARD') {
      form.setFieldsValue({
        totalShares: 0,
        totalShareholders: 0,
        participantCount: meeting?.participantCount || 0
      })
    }
  }

  return (
    <Modal
      title="Cập nhật cuộc họp"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã cuộc họp"
            name="meetingCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã cuộc họp' },
              { 
                min: 3, 
                message: 'Mã cuộc họp phải có ít nhất 3 ký tự' 
              },
              { 
                max: 50, 
                message: 'Mã cuộc họp không được vượt quá 50 ký tự' 
              }
            ]}
            help={
              <div className="mt-1 text-xs text-gray-500">
                <div className="flex items-start gap-1">
                  <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                  <span>Định dạng chuẩn: [Tên khách hàng]_[Loại cuộc họp]_[Thời gian]</span>
                </div>
                <div className="ml-5 mt-0.5">
                  <div className="text-gray-400">Ví dụ:</div>
                  <ul className="list-disc pl-4 text-gray-400 space-y-0.5">
                    <li>CII_ĐHĐCĐ_01.25</li>
                    <li>VIC_HĐQT_Q2.24</li>
                  </ul>
                </div>
              </div>
            }
          >
            <Input placeholder="VD: CII_ĐHĐCĐ_01.25" disabled />
          </Form.Item>

          <Form.Item
            label="Loại cuộc họp"
            name="meetingType"
            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc họp' }]}
          >
            <Select 
              placeholder="Chọn loại cuộc họp"
              onChange={handleMeetingTypeChange}
              disabled={meeting?.status !== 'DRAFT'} // Chỉ cho phép thay đổi khi status là DRAFT
            >
              <Option value="AGM">Đại hội đồng cổ đông</Option>
              <Option value="BOARD">Họp hội đồng quản trị</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="mb-4">
          <Alert
            message="Lưu ý khi cập nhật cuộc họp"
            description={
              <div className="space-y-2">
                <div>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-sm">
                    <li>Mã cuộc họp không thể thay đổi sau khi tạo</li>
                    <li>Chỉ có thể thay đổi loại cuộc họp khi trạng thái là DRAFT</li>
                    <li>Các thông tin liên quan sẽ được điều chỉnh tự động theo loại cuộc họp</li>
                  </ul>
                </div>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
        </div>

        <Form.Item
          label="Tên cuộc họp"
          name="meetingName"
          rules={[
            { required: true, message: 'Vui lòng nhập tên cuộc họp' },
            { min: 5, message: 'Tên cuộc họp phải có ít nhất 5 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên đầy đủ của cuộc họp" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả về cuộc họp"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Ngày và giờ họp"
            name="meetingDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày họp' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>

          <Form.Item
            label="Địa điểm"
            name="meetingLocation"
          >
            <Input placeholder="Nhập địa điểm tổ chức" />
          </Form.Item>
        </div>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="meetingAddress"
        >
          <TextArea 
            rows={2} 
            placeholder="Nhập địa chỉ chi tiết (không bắt buộc)"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Bắt đầu đăng ký"
            name="registrationStart"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>

          <Form.Item
            label="Kết thúc đăng ký"
            name="registrationEnd"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Bắt đầu bỏ phiếu"
            name="votingStart"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>

          <Form.Item
            label="Kết thúc bỏ phiếu"
            name="votingEnd"
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian"
            />
          </Form.Item>
        </div>

        {/* Các field hiển thị theo loại cuộc họp */}
        {meetingType === 'AGM' ? (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Tổng số cổ phần"
              name="totalShares"
              rules={[
                { 
                  type: 'number', 
                  min: 0, 
                  message: 'Tổng số cổ phần phải lớn hơn hoặc bằng 0' 
                }
              ]}
              help="Tổng số cổ phần phát hành"
            >
              <InputNumber 
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập tổng số cổ phần"
              />
            </Form.Item>

            <Form.Item
              label="Tổng số cổ đông"
              name="totalShareholders"
              rules={[
                { 
                  type: 'number', 
                  min: 0, 
                  message: 'Tổng số cổ đông phải lớn hơn hoặc bằng 0' 
                }
              ]}
              help="Số lượng cổ đông tham dự"
            >
              <InputNumber 
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập tổng số cổ đông"
              />
            </Form.Item>
          </div>
        ) : meetingType === 'BOARD' ? (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Số lượng thành viên"
              name="participantCount"
              rules={[
                { 
                  type: 'number', 
                  min: 1, 
                  message: 'Số lượng thành viên phải lớn hơn 0' 
                }
              ]}
              help="Tổng số thành viên HĐQT tham dự"
            >
              <InputNumber 
                min={1}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng thành viên"
              />
            </Form.Item>
            
            {/* Cột thứ 2 để giữ layout */}
            <div></div>
          </div>
        ) : (
          // Hiển thị khi chưa có meeting type
          <Alert
            message="Đang tải thông tin cuộc họp..."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Thông báo giải thích */}
        {meetingType === 'AGM' && (
          <Alert
            message="Thông tin cho Đại hội đồng cổ đông"
            description="Vui lòng nhập thông tin về cổ phần và cổ đông. Số lượng thành viên không áp dụng cho loại cuộc họp này."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {meetingType === 'BOARD' && (
          <Alert
            message="Thông tin cho Họp Hội đồng quản trị"
            description="Vui lòng nhập số lượng thành viên HĐQT tham dự. Thông tin về cổ phần và cổ đông không áp dụng cho loại cuộc họp này."
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Status field (chỉ hiển thị khi cần) */}
        {meeting?.status && meeting.status !== 'DRAFT' && (
          <Form.Item
            label="Trạng thái"
            name="status"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="DRAFT">Nháp</Option>
              <Option value="SCHEDULED">Đã lên lịch</Option>
              <Option value="ONGOING">Đang diễn ra</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
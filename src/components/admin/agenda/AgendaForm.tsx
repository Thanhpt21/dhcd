// src/components/admin/agenda/AgendaForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, Select, DatePicker, message, Button, TimePicker, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateAgenda } from '@/hooks/agenda/useCreateAgenda'
import { useUpdateAgenda } from '@/hooks/agenda/useUpdateAgenda'
import { Agenda, AgendaStatus } from '@/types/agenda.type'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface AgendaFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  meetingId: number
  agenda?: Agenda | null
  isEdit?: boolean
}

export default function AgendaForm({
  open,
  onClose,
  onSuccess,
  meetingId,
  agenda,
  isEdit = false
}: AgendaFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createAgenda, isPending: isCreating } = useCreateAgenda()
  const { mutateAsync: updateAgenda, isPending: isUpdating } = useUpdateAgenda()

  const isPending = isCreating || isUpdating
  const [useTimeRange, setUseTimeRange] = useState(false)

  const statusOptions = [
    { value: AgendaStatus.PENDING, label: 'Chờ thực hiện' },
    { value: AgendaStatus.ONGOING, label: 'Đang diễn ra' },
    { value: AgendaStatus.COMPLETED, label: 'Đã hoàn thành' },
    { value: AgendaStatus.CANCELLED, label: 'Đã hủy' },
    { value: AgendaStatus.DELAYED, label: 'Bị trì hoãn' },
  ]

  useEffect(() => {
    if (open && agenda) {
      form.setFieldsValue({
        ...agenda,
        meetingId: agenda.meetingId,
        startTime: agenda.startTime ? dayjs(agenda.startTime) : null,
        endTime: agenda.endTime ? dayjs(agenda.endTime) : null
      })
      setUseTimeRange(!!agenda.startTime && !!agenda.endTime)
    } else if (open) {
      form.setFieldsValue({
        meetingId,
        displayOrder: 0,
        status: AgendaStatus.PENDING
      })
      setUseTimeRange(false)
    }
  }, [open, agenda, meetingId, form])

  const calculateDuration = (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => {
    return endTime.diff(startTime, 'minute')
  }

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        startTime: useTimeRange && values.startTime ? values.startTime.toISOString() : undefined,
        endTime: useTimeRange && values.endTime ? values.endTime.toISOString() : undefined,
        duration: useTimeRange && values.startTime && values.endTime 
          ? calculateDuration(values.startTime, values.endTime)
          : values.duration
      }

      if (isEdit && agenda) {
        await updateAgenda({
          id: agenda.id,
          ...payload
        })
      } else {
        await createAgenda(payload)
      }
      onSuccess()
      form.resetFields()
      setUseTimeRange(false)
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleClose = () => {
    form.resetFields()
    setUseTimeRange(false)
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Cập nhật Chương trình' : 'Thêm Chương trình Nghị sự'}
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
          displayOrder: 0,
          status: AgendaStatus.PENDING
        }}
      >
        <Form.Item name="meetingId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã chương trình"
            name="agendaCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã chương trình' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: AGENDA-001" />
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
          label="Tiêu đề"
          name="title"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tiêu đề chương trình nghị sự" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả chi tiết về chương trình nghị sự"
          />
        </Form.Item>

        <Form.Item
          label="Diễn giả"
          name="speaker"
        >
          <Input placeholder="Nhập tên diễn giả (nếu có)" />
        </Form.Item>

        <div className="mb-4">
          <Switch
            checked={useTimeRange}
            onChange={setUseTimeRange}
            checkedChildren="Sử dụng khoảng thời gian"
            unCheckedChildren="Sử dụng thời lượng cố định"
          />
        </div>

        {useTimeRange ? (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Thời gian bắt đầu"
              name="startTime"
            >
              <TimePicker 
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn giờ bắt đầu"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian kết thúc"
              name="endTime"
            >
              <TimePicker 
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn giờ kết thúc"
              />
            </Form.Item>
          </div>
        ) : (
          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập thời lượng dự kiến"
            />
          </Form.Item>
        )}

        <Form.Item
          label="URL tài liệu trình chiếu"
          name="presentationUrl"
        >
          <Input placeholder="https://example.com/presentation.pdf" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
        >
          <Select placeholder="Chọn trạng thái">
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            {isEdit ? 'Cập nhật' : 'Thêm'} Chương trình
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
// src/components/admin/questions/QuestionUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker } from 'antd'
import { useEffect } from 'react'
import { useUpdateQuestion } from '@/hooks/question/useUpdateQuestion'
import { Question, QuestionType, QuestionPriority, QuestionStatus } from '@/types/question.type'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface QuestionUpdateModalProps {
  open: boolean
  onClose: () => void
  question: Question | null
  refetch?: () => void
}

export const QuestionUpdateModal = ({
  open,
  onClose,
  question,
  refetch,
}: QuestionUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateQuestion()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (question && open) {
      const initialValues = {
        ...question,
        answeredAt: question.answeredAt ? dayjs(question.answeredAt) : null,
      }
      form.setFieldsValue(initialValues)
    }
  }, [question, open, form])

  const onFinish = async (values: any) => {
    if (!question) return
    
    try {
      const payload = {
        ...values,
        answeredAt: values.answeredAt?.toISOString(),
      }

      console.log("📤 Payload cập nhật câu hỏi:", payload)

      await mutateAsync({
        id: question.id,
        data: payload,
      })
      message.success('Cập nhật câu hỏi thành công')
      await queryClient.invalidateQueries({ 
        queryKey: ['questions'] 
      })
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật câu hỏi')
    }
  }

  return (
    <Modal
      title="Cập nhật câu hỏi"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Nội dung câu hỏi"
          name="questionText"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập nội dung câu hỏi"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Loại câu hỏi"
            name="questionType"
          >
            <Select placeholder="Chọn loại câu hỏi">
              <Option value={QuestionType.GENERAL}>Chung</Option>
              <Option value={QuestionType.FINANCIAL}>Tài chính</Option>
              <Option value={QuestionType.OPERATIONAL}>Vận hành</Option>
              <Option value={QuestionType.STRATEGIC}>Chiến lược</Option>
              <Option value={QuestionType.OTHER}>Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức độ ưu tiên"
            name="priority"
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value={QuestionPriority.LOW}>Thấp</Option>
              <Option value={QuestionPriority.MEDIUM}>Trung bình</Option>
              <Option value={QuestionPriority.HIGH}>Cao</Option>
              <Option value={QuestionPriority.URGENT}>Khẩn cấp</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Trạng thái"
          name="status"
        >
          <Select placeholder="Chọn trạng thái">
            <Option value={QuestionStatus.PENDING}>Chờ xử lý</Option>
            <Option value={QuestionStatus.UNDER_REVIEW}>Đang xem xét</Option>
            <Option value={QuestionStatus.ANSWERED}>Đã trả lời</Option>
            <Option value={QuestionStatus.REJECTED}>Từ chối</Option>
            <Option value={QuestionStatus.ARCHIVED}>Lưu trữ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Câu trả lời"
          name="answerText"
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập câu trả lời..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Người trả lời"
            name="answeredBy"
          >
            <Input placeholder="Nhập tên người trả lời" />
          </Form.Item>

          <Form.Item
            label="Thời gian trả lời"
            name="answeredAt"
          >
            <DatePicker 
              format="DD/MM/YYYY HH:mm"
              showTime
              style={{ width: '100%' }}
              placeholder="Chọn thời gian trả lời"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Ghi chú quản trị"
          name="adminNotes"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập ghi chú nội bộ..."
          />
        </Form.Item>

        <Form.Item
          label="Chọn cho phiên hỏi đáp"
          name="isSelected"
          valuePropName="checked"
        >
          <Select>
            <Option value={true}>Có</Option>
            <Option value={false}>Không</Option>
          </Select>
        </Form.Item>

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
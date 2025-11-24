// src/components/admin/proxy/ProxyCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Upload } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateProxy } from '@/hooks/proxy/useCreateProxy'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'
import { useAllShareholders } from '@/hooks/shareholder/useAllShareholders'
import type { ProxyStatus } from '@/types/proxy.type'
import dayjs from 'dayjs'
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface ProxyCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const ProxyCreateModal = ({
  open,
  onClose,
  refetch,
}: ProxyCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateProxy()
  const { data: meetingsData, isLoading: isLoadingMeetings } = useAllMeetings()
  const { data: shareholdersData, isLoading: isLoadingShareholders } = useAllShareholders()
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      
      // Append all form data (trừ dates và documentUrl)
      Object.keys(values).forEach(key => {
        if (key !== 'documentUrl' && key !== 'startDate' && key !== 'endDate' && values[key] !== undefined) {
          formData.append(key, values[key])
        }
      })

      // Append dates
      formData.append('startDate', values.startDate?.toISOString())
      formData.append('endDate', values.endDate?.toISOString())
      formData.append('createdBy', '1') // TODO: Get from auth context

      // Append file nếu có
      if (documentFile) {
        formData.append('documentUrl', documentFile)
      }

      await mutateAsync(formData)
      message.success('Tạo ủy quyền thành công')
      onClose()
      form.resetFields()
      setDocumentFile(null)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo ủy quyền')
    }
  }

  const handleDocumentUpload = (file: File) => {
    const isValidType = [
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type)
    
    const isValidSize = file.size / 1024 / 1024 < 10

    if (!isValidType) {
      message.error('Chỉ chấp nhận file PDF, Word hoặc hình ảnh')
      return false
    }

    if (!isValidSize) {
      message.error('File không được vượt quá 10MB')
      return false
    }

    setDocumentFile(file)
    return false // Prevent default upload
  }

  const handleRemoveDocument = () => {
    setDocumentFile(null)
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setDocumentFile(null)
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo ủy quyền mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
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
            label="Trạng thái"
            name="status"
            initialValue="PENDING"
          >
            <Select>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Cổ đông ủy quyền"
            name="shareholderId"
            rules={[{ required: true, message: 'Vui lòng chọn cổ đông' }]}
          >
            <Select
              placeholder="Chọn cổ đông ủy quyền"
              loading={isLoadingShareholders}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const label = String(option?.label ?? '').toLowerCase()
                return label.includes(input.toLowerCase())
              }}
            >
              {shareholdersData?.map((shareholder: any) => (
                <Option 
                  key={shareholder.id} 
                  value={shareholder.id}
                  label={`${shareholder.shareholderCode} - ${shareholder.fullName}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{shareholder.shareholderCode}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {shareholder.fullName}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Người nhận ủy quyền"
            name="proxyPersonId"
            rules={[{ required: true, message: 'Vui lòng chọn người nhận ủy quyền' }]}
          >
            <Select
              placeholder="Chọn người nhận ủy quyền"
              loading={isLoadingShareholders}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const label = String(option?.label ?? '').toLowerCase()
                return label.includes(input.toLowerCase())
              }}
            >
              {shareholdersData?.map((shareholder: any) => (
                <Option 
                  key={shareholder.id} 
                  value={shareholder.id}
                  label={`${shareholder.shareholderCode} - ${shareholder.fullName}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{shareholder.shareholderCode}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {shareholder.fullName}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Số cổ phần ủy quyền"
            name="shares"
            rules={[
              { required: true, message: 'Vui lòng nhập số cổ phần' },
              { type: 'number', min: 1, message: 'Số cổ phần phải lớn hơn 0' }
            ]}
          >
            <InputNumber 
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập số cổ phần"
            />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Lý do ủy quyền"
          name="reason"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập lý do ủy quyền (không bắt buộc)"
          />
        </Form.Item>

        <Form.Item
          label="Tài liệu ủy quyền"
        >
          {/* Upload file */}
          <Upload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            beforeUpload={handleDocumentUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              {documentFile ? 'Thay đổi file' : 'Tải lên tài liệu'}
            </Button>
          </Upload>

          {/* Hiển thị file được chọn */}
          {documentFile && (
            <div className="mt-2 flex items-center gap-2 text-green-600">
              <PaperClipOutlined />
              <span>{documentFile.name}</span>
              <Button 
                type="link" 
                danger 
                size="small"
                onClick={handleRemoveDocument}
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-1">
            Hỗ trợ: PDF, Word, JPG, PNG (tối đa 10MB)
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Tạo ủy quyền
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
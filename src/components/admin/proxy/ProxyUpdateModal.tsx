// src/components/admin/proxy/ProxyUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button, Select, DatePicker, InputNumber, Upload } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateProxy } from '@/hooks/proxy/useUpdateProxy'
import type { Proxy } from '@/types/proxy.type'
import dayjs from 'dayjs'
import { UploadOutlined, PaperClipOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface ProxyUpdateModalProps {
  open: boolean
  onClose: () => void
  proxy: Proxy | null
  refetch?: () => void
}

export const ProxyUpdateModal = ({
  open,
  onClose,
  proxy,
  refetch,
}: ProxyUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateProxy()
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false)

  const onFinish = async (values: any) => {
    if (!proxy) return
    
    try {
      const formData = new FormData()
      
      // Append all form data (trừ dates và documentUrl)
      Object.keys(values).forEach(key => {
        if (key !== 'documentUrl' && key !== 'startDate' && key !== 'endDate' && values[key] !== undefined) {
          formData.append(key, values[key])
        }
      })

      // Append dates
      if (values.startDate) {
        formData.append('startDate', values.startDate.toISOString())
      }
      if (values.endDate) {
        formData.append('endDate', values.endDate.toISOString())
      }

      // Xử lý document
      if (documentFile) {
        // Upload file mới
        formData.append('documentUrl', documentFile)
      } else if (removeExistingDocument) {
        // Xóa file hiện tại - gửi empty string để backend hiểu là xóa
        formData.append('documentUrl', '')
      }
      // Nếu không có documentFile và không removeExistingDocument => giữ nguyên file cũ

      await mutateAsync({
        id: proxy.id,
        formData
      })
      
      message.success('Cập nhật ủy quyền thành công')
      onClose()
      form.resetFields()
      setDocumentFile(null)
      setRemoveExistingDocument(false)
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật ủy quyền')
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
    setRemoveExistingDocument(false) // Reset remove flag khi upload file mới
    return false // Prevent default upload
  }

  const handleRemoveDocument = () => {
    setDocumentFile(null)
    if (proxy?.documentUrl) {
      setRemoveExistingDocument(true)
    }
  }

  const handleCancelRemove = () => {
    setRemoveExistingDocument(false)
  }

  useEffect(() => {
    if (open && proxy) {
      form.setFieldsValue({
        shares: proxy.shares,
        status: proxy.status,
        startDate: proxy.startDate ? dayjs(proxy.startDate) : null,
        endDate: proxy.endDate ? dayjs(proxy.endDate) : null,
        reason: proxy.reason,
        // Không set documentUrl vào form vì đang dùng file upload
      })
      setDocumentFile(null)
      setRemoveExistingDocument(false)
    } else if (!open) {
      form.resetFields()
      setDocumentFile(null)
      setRemoveExistingDocument(false)
    }
  }, [open, proxy, form])

  return (
    <Modal
      title="Cập nhật ủy quyền"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
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
            label="Trạng thái"
            name="status"
          >
            <Select>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Đã từ chối</Option>
              <Option value="REVOKED">Đã thu hồi</Option>
              <Option value="EXPIRED">Đã hết hạn</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            placeholder="Nhập lý do ủy quyền"
          />
        </Form.Item>

        <Form.Item
          label="Tài liệu ủy quyền"
        >
          {/* Hiển thị file hiện tại nếu có */}
          {proxy?.documentUrl && !removeExistingDocument && !documentFile && (
            <div className="mb-3 p-3 border border-green-200 rounded bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaperClipOutlined className="text-green-600" />
                  <span className="text-green-800">Tài liệu hiện tại:</span>
                  <a 
                    href={proxy.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <EyeOutlined />
                    Xem tài liệu
                  </a>
                </div>
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
            </div>
          )}

          {/* Hiển thị thông báo xóa file */}
          {removeExistingDocument && (
            <div className="mb-3 p-3 border border-orange-200 rounded bg-orange-50">
              <div className="flex items-center justify-between">
                <span className="text-orange-800">⚠️ Tài liệu sẽ bị xóa</span>
                <Button 
                  type="link" 
                  size="small"
                  onClick={handleCancelRemove}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Upload file mới */}
          <Upload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            beforeUpload={handleDocumentUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              {documentFile ? 'Thay đổi file' : 'Tải lên tài liệu mới'}
            </Button>
          </Upload>

          {/* Hiển thị file mới được chọn */}
          {documentFile && (
            <div className="mt-2 flex items-center gap-2 text-green-600">
              <PaperClipOutlined />
              <span>{documentFile.name}</span>
              <Button 
                type="link" 
                danger 
                size="small"
                onClick={() => setDocumentFile(null)}
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
            Cập nhật ủy quyền
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
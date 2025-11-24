// src/components/admin/document/DocumentForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, Select, Switch, message, Button, Upload } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateDocument } from '@/hooks/document/useCreateDocument'
import { useUpdateDocument } from '@/hooks/document/useUpdateDocument'
import { Document, DocumentCategory } from '@/types/document.type'
import { UploadOutlined, PaperClipOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface DocumentFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  meetingId: number
  document?: Document | null
  isEdit?: boolean
}

export default function DocumentForm({
  open,
  onClose,
  onSuccess,
  meetingId,
  document,
  isEdit = false
}: DocumentFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createDocument, isPending: isCreating } = useCreateDocument()
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument()
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false)

  const isPending = isCreating || isUpdating

  const categoryOptions = [
    { value: DocumentCategory.FINANCIAL_REPORT, label: 'Báo cáo Tài chính' },
    { value: DocumentCategory.RESOLUTION, label: 'Nghị quyết' },
    { value: DocumentCategory.MINUTES, label: 'Biên bản' },
    { value: DocumentCategory.PRESENTATION, label: 'Trình chiếu' },
    { value: DocumentCategory.GUIDE, label: 'Hướng dẫn' },
    { value: DocumentCategory.OTHER, label: 'Khác' },
  ]

  const handleDocumentUpload = (file: File) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'text/plain'
    ].includes(file.type)
    
    const isValidSize = file.size / 1024 / 1024 < 50 // 50MB

    if (!isValidType) {
      message.error('Chỉ chấp nhận file PDF, Word, Excel, PowerPoint, hình ảnh hoặc text')
      return false
    }

    if (!isValidSize) {
      message.error('File không được vượt quá 50MB')
      return false
    }

    setDocumentFile(file)
    setRemoveExistingDocument(false)
    
    // Auto-fill file type và file size
    form.setFieldsValue({
      fileType: file.type,
      fileSize: file.size
    })
    
    return false // Prevent default upload
  }

  const handleRemoveDocument = () => {
    setDocumentFile(null)
    if (document?.fileUrl) {
      setRemoveExistingDocument(true)
    }
    form.setFieldsValue({
      fileType: undefined,
      fileSize: undefined
    })
  }

  const handleCancelRemove = () => {
    setRemoveExistingDocument(false)
  }

  useEffect(() => {
    if (open && document) {
      form.setFieldsValue({
        documentCode: document.documentCode,
        title: document.title,
        description: document.description,
        category: document.category,
        displayOrder: document.displayOrder,
        isPublic: document.isPublic,
        // Đã xóa uploadedBy
        fileType: document.fileType,
        fileSize: document.fileSize,
        meetingId: document.meetingId,
      })
      setDocumentFile(null)
      setRemoveExistingDocument(false)
    } else if (open) {
      form.setFieldsValue({
        meetingId,
        displayOrder: 0,
        isPublic: false,
        category: DocumentCategory.OTHER,
        // Đã xóa uploadedBy
      })
      setDocumentFile(null)
      setRemoveExistingDocument(false)
    }
  }, [open, document, meetingId, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      
      // Append all form data (không có uploadedBy)
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          // Chuyển đổi các field number sang string
          if (['meetingId', 'displayOrder', 'fileSize'].includes(key)) {
            formData.append(key, values[key].toString())
          } else {
            formData.append(key, values[key])
          }
        }
      })

      // Xử lý file upload
      if (documentFile) {
        formData.append('file', documentFile)
      } else if (removeExistingDocument && isEdit) {
        formData.append('file', '')
      }

      if (isEdit && document) {
        await updateDocument({
          id: document.id,
          formData
        })
      } else {
        await createDocument(formData)
      }
      
      onSuccess()
      handleClose()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleClose = () => {
    form.resetFields()
    setDocumentFile(null)
    setRemoveExistingDocument(false)
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Cập nhật Tài liệu' : 'Thêm Tài liệu Mới'}
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
      >
        <Form.Item name="meetingId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Mã tài liệu"
            name="documentCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã tài liệu' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input placeholder="VD: DOC-001" />
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
          <Input placeholder="Nhập tiêu đề tài liệu" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả chi tiết về tài liệu"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Loại tài liệu"
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu' }]}
          >
            <Select placeholder="Chọn loại tài liệu">
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* ĐÃ XÓA FIELD NGƯỜI UPLOAD */}
        </div>

        {/* File Upload Section */}
        <Form.Item
          label="Tài liệu"
          required={!isEdit}
        >
          {/* Hiển thị file hiện tại nếu có (chỉ trong chế độ edit) */}
          {isEdit && document?.fileUrl && !removeExistingDocument && !documentFile && (
            <div className="mb-3 p-3 border border-green-200 rounded bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaperClipOutlined className="text-green-600" />
                  <span className="text-green-800">Tài liệu hiện tại:</span>
                  <a 
                    href={document.fileUrl} 
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
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
            beforeUpload={handleDocumentUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              {documentFile ? 'Thay đổi file' : 'Tải lên tài liệu'}
            </Button>
          </Upload>

          {/* Hiển thị file mới được chọn */}
          {documentFile && (
            <div className="mt-2 flex items-center gap-2 text-green-600">
              <PaperClipOutlined />
              <span className="flex-1 truncate">{documentFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <Button 
                type="link" 
                danger 
                size="small"
                onClick={() => {
                  setDocumentFile(null)
                  form.setFieldsValue({
                    fileType: undefined,
                    fileSize: undefined
                  })
                }}
              >
                Xóa
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-1">
            Hỗ trợ: PDF, Word, Excel, PowerPoint, JPG, PNG, TXT (tối đa 50MB)
          </div>
        </Form.Item>

        {/* Auto-filled file info */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Loại file"
            name="fileType"
            rules={[{ required: true, message: 'Vui lòng chọn file' }]}
          >
            <Input placeholder="Sẽ tự động điền khi chọn file" readOnly />
          </Form.Item>

          <Form.Item
            label="Kích thước file (bytes)"
            name="fileSize"
            rules={[
              { required: true, message: 'Vui lòng chọn file' },
              { type: 'number', min: 1, message: 'Kích thước phải lớn hơn 0' },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Sẽ tự động điền khi chọn file"
              readOnly
            />
          </Form.Item>
        </div>

        <Form.Item
          label=" "
          name="isPublic"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Công khai"
            unCheckedChildren="Riêng tư"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
            disabled={!isEdit && !documentFile}
          >
            {isEdit ? 'Cập nhật' : 'Thêm'} Tài liệu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
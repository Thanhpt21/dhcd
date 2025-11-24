// src/components/admin/verification/SendBatchEmailsModal.tsx
'use client'

import { Modal, Form, Select, message, Space, Tag, Table, Checkbox, Button } from 'antd'
import { useEffect, useState } from 'react'
import { useSendBatchVerificationEmails } from '@/hooks/verification/useSendBatchVerificationEmails'
import { useAllVerificationLinks } from '@/hooks/verification/useAllVerificationLinks'
import { useQueryClient } from '@tanstack/react-query' 
import type { ColumnsType } from 'antd/es/table'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Option } = Select

interface SendBatchEmailsModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export function SendBatchEmailsModal({ open, onClose, refetch }: SendBatchEmailsModalProps) {
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [verificationType, setVerificationType] = useState('')
  const queryClient = useQueryClient()

  const { data: allLinks, isLoading } = useAllVerificationLinks()
  const { mutateAsync: sendBatchEmails, isPending } = useSendBatchVerificationEmails()

  useEffect(() => {
    if (open) {      
      queryClient.invalidateQueries({ queryKey: ['allVerificationLinks'] })
      form.resetFields()
      setSelectedRowKeys([])
      setVerificationType('')
    }
  }, [open, queryClient, form])

  const filteredLinks = allLinks?.data?.filter((link: any) => 
    (!verificationType || link.verificationType === verificationType) &&
    link.shareholder?.email
  ) || []

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (selectedRowKeys.length === 0) {
        message.warning('Vui lòng chọn ít nhất một link xác thực')
        return
      }

      await sendBatchEmails({
        meetingId: values.meetingId,
        shareholderIds: selectedRowKeys.map(id => 
          filteredLinks.find((link: any) => link.id === id)?.shareholderId
        ).filter(Boolean),
        verificationType: values.verificationType
      })

      message.success('Gửi email hàng loạt thành công')
      handleClose()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gửi email thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    setSelectedRowKeys([])
    setVerificationType('')
    onClose()
  }

  const meetingOptions = Array.from(new Set(
    filteredLinks.map((link: any) => link.meeting?.id).filter(Boolean)
  )).map(meetingId => {
    const meeting = filteredLinks.find((link: any) => link.meeting?.id === meetingId)?.meeting
    return { value: meetingId, label: meeting?.meetingName }
  })

  // Hàm chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(filteredLinks.map((link: any) => link.id))
    } else {
      setSelectedRowKeys([])
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Mã xác thực',
      dataIndex: 'verificationCode',
      key: 'verificationCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Cổ đông',
      dataIndex: 'shareholder',
      key: 'shareholder',
      render: (shareholder: any) => (
        <div>
          <div className="font-medium">{shareholder?.fullName}</div>
          <div className="text-xs text-gray-500">{shareholder?.email}</div>
        </div>
      ),
    },
    
    {
      title: 'Email',
      key: 'emailStatus',
      width: 100,
      render: (record: any) => (
        <Tag 
          color={record.emailSent ? 'green' : 'orange'} 
          icon={record.emailSent ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {record.emailSent ? 'Đã gửi' : 'Chưa gửi'}
        </Tag>
      ),
    },
  ]

  // Sử dụng rowSelection của Antd
  const rowSelection = {
    selectedRowKeys,
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        setSelectedRowKeys(filteredLinks.map((link: any) => link.id))
      } else {
        setSelectedRowKeys([])
      }
    },
    onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
      if (selected) {
        setSelectedRowKeys(prev => [...prev, record.id])
      } else {
        setSelectedRowKeys(prev => prev.filter(id => id !== record.id))
      }
    },
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys as number[])
    },
  }

  return (
    <Modal
      title="Gửi email xác thực hàng loạt"
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={isPending}
      width={800}
      bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="verificationType"
            label="Loại xác thực"
            rules={[{ required: true, message: 'Vui lòng chọn loại xác thực' }]}
          >
            <Select 
              placeholder="Chọn loại xác thực"
              onChange={setVerificationType}
              allowClear
            >
              <Option value="REGISTRATION">Đăng ký</Option>
              <Option value="ATTENDANCE">Điểm danh</Option>
              <Option value="VOTING">Bỏ phiếu</Option>
              <Option value="DOCUMENT_ACCESS">Tài liệu</Option>
              <Option value="LIVESTREAM_ACCESS">Livestream</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="meetingId"
            label="Cuộc họp"
            rules={[{ required: true, message: 'Vui lòng chọn cuộc họp' }]}
          >
            <Select 
              placeholder="Chọn cuộc họp"
              loading={isLoading}
              options={meetingOptions}
            />
          </Form.Item>
        </div>

        <Form.Item label="Chọn link xác thực">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium">
              Đã chọn: <strong>{selectedRowKeys.length}</strong> / {filteredLinks.length} link xác thực
            </span>
            {selectedRowKeys.length > 0 && (
              <Button 
                type="link" 
                size="small" 
                onClick={() => setSelectedRowKeys([])}
                className="text-red-500"
              >
                Bỏ chọn tất cả
              </Button>
            )}
          </div>
          
          <Table
            size="small"
            columns={columns}
            dataSource={filteredLinks}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} link`,
            }}
            scroll={{ y: 300 }}
            rowSelection={rowSelection}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
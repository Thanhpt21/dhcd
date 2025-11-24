'use client'

import { Modal, Form, Input, Select, Switch, Button, message, Row, Col } from 'antd'
import { useCreateReportTemplate } from '@/hooks/report/useCreateReportTemplate'

const { Option } = Select

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export function ReportTemplateCreateModal({ open, onClose, refetch }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: createReportTemplate, isPending } = useCreateReportTemplate()

  const handleSubmit = async (values: any) => {
    try {
      // Đảm bảo luôn là EXCEL
      const submitValues = {
        ...values,
        outputFormat: 'EXCEL'
      }
      await createReportTemplate(submitValues)
      message.success('Tạo report template thành công')
      refetch?.()
      onClose()
      form.resetFields()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạo template thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const reportTypes = [
    { value: 'ATTENDANCE_REPORT', label: 'Báo Cáo Điểm Danh' },
    { value: 'VOTING_RESULTS', label: 'Kết Quả Bỏ Phiếu' },
    { value: 'REGISTRATION_STATS', label: 'Thống Kê Đăng Ký' },
    { value: 'QUESTION_ANALYTICS', label: 'Phân Tích Câu Hỏi' },
    { value: 'SHAREHOLDER_ANALYSIS', label: 'Báo Cáo Cổ Đông' }
  ]

  return (
    <Modal
      title="Tạo Mẫu Báo Cáo Mới"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          outputFormat: 'EXCEL', // Mặc định Excel
          isActive: true
        }}
      >
        <Form.Item
          name="templateName"
          label="Tên mẫu báo cáo"
          rules={[
            { required: true, message: 'Vui lòng nhập tên mẫu báo cáo' },
            { min: 3, message: 'Tên mẫu báo cáo phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên mẫu báo cáo" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="templateType"
              label="Loại báo cáo"
              rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
            >
              <Select placeholder="Chọn loại báo cáo">
                {reportTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Đã xóa Form.Item outputFormat */}
          </Col>
        </Row>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu hóa" />
        </Form.Item>

        {/* Thêm thông báo định dạng mặc định */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Lưu ý:</strong> Mẫu báo cáo sẽ xuất dưới định dạng Excel (.xlsx)
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo Mẫu Báo Cáo
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
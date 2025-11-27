'use client'

import { Modal, Form, Input, Select, Button, message, Row, Col } from 'antd'
import { useState, useEffect } from 'react'
import type { GeneratedReport } from '@/types/report.type'
import { useGenerateReport } from '@/hooks/report/useGenerateReport'
import { useAllReportTemplates } from '@/hooks/report/useAllReportTemplates'
import { useAllMeetings } from '@/hooks/meeting/useAllMeetings'

const { Option } = Select
const { TextArea } = Input

interface Props {
  open: boolean
  onClose: () => void
  existingReport?: GeneratedReport | null
  refetch?: () => void
}

export function GenerateReportModal({ open, onClose, existingReport, refetch }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: generateReport, isPending } = useGenerateReport()
  const { data: allTemplates } = useAllReportTemplates()
  
  // Lấy tất cả meetings và lọc những cái có status COMPLETED
  const { data: allMeetingsData } = useAllMeetings()

  
  // Lọc meetings có status COMPLETED
    const completedMeetings = Array.isArray(allMeetingsData) 
    ? allMeetingsData.filter((meeting: any) => meeting.status === 'COMPLETED')
    : []


  useEffect(() => {
    if (existingReport && open) {
      form.setFieldsValue({
        reportName: `${existingReport.reportName} (Tạo lại)`,
        meetingId: existingReport.meetingId,
        templateId: existingReport.templateId,
        reportFormat: 'EXCEL'
      })
    } else if (open) {
      form.setFieldsValue({
        reportFormat: 'EXCEL'
      })
    }
  }, [existingReport, open, form])

  const handleSubmit = async (values: any) => {
    try {
      // Đảm bảo luôn là EXCEL
      const submitValues = {
        ...values,
        reportFormat: 'EXCEL'
      }
      await generateReport(submitValues)
      message.success('Tạo báo cáo thành công')
      refetch?.()
      onClose()
      form.resetFields()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạo báo cáo thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={existingReport ? "Tạo Lại Báo Cáo" : "Tạo Báo Cáo Mới"}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="reportName"
          label="Tên báo cáo"
          rules={[
            { required: true, message: 'Vui lòng nhập tên báo cáo' },
            { min: 3, message: 'Tên báo cáo phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên báo cáo" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="meetingId"
              label="Cuộc họp (Đã hoàn thành)"
              rules={[{ required: true, message: 'Vui lòng chọn cuộc họp đã hoàn thành' }]}
            >
              <Select 
                placeholder="Chọn cuộc họp đã hoàn thành"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (!option?.children) return false
                  return String(option.children).toLowerCase().includes(input.toLowerCase())
                }}
              >
                {completedMeetings.map((meeting: any) => (
                  <Option key={meeting.id} value={meeting.id}>
                    {meeting.meetingName} ({meeting.meetingCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="templateId"
              label="Mẫu báo cáo"
              rules={[{ required: true, message: 'Vui lòng chọn mẫu báo cáo' }]}
            >
              <Select placeholder="Chọn mẫu báo cáo">
                {allTemplates?.map((template: any) => (
                  <Option key={template.id} value={template.id}>
                    {template.templateName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="filters"
          label="Bộ lọc (tùy chọn)"
        >
          <TextArea 
            rows={3}
            placeholder='Nhập bộ lọc dạng JSON, ví dụ: {"fromDate": "2024-01-01", "toDate": "2024-12-31"}'
          />
        </Form.Item>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Lưu ý:</strong> Báo cáo sẽ được xuất dưới định dạng Excel (.xlsx)
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            {existingReport ? 'Tạo Lại' : 'Tạo Báo Cáo'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
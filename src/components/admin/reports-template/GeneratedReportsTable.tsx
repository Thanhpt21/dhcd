'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Card, Progress, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, DownloadOutlined, DeleteOutlined, ReloadOutlined, FileSearchOutlined, PauseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { GeneratedReport } from '@/types/report.type'
import { GeneratedReportDetailModal } from './GeneratedReportDetailModal'
import { GenerateReportModal } from './GenerateReportModal'
import dayjs from 'dayjs'
import { useGeneratedReports } from '@/hooks/report/useGeneratedReports'
import { useDeleteGeneratedReport } from '@/hooks/report/useDeleteGeneratedReport'
import { useAllReportTemplates } from '@/hooks/report/useAllReportTemplates'
import { useExportWithProgress } from '@/hooks/report/useExportWithProgress'

const { Option } = Select

interface DownloadProgress {
  loaded: number
  total: number
  percent: number
  fileName: string
  status: 'downloading' | 'paused' | 'completed' | 'error'
}

export default function GeneratedReportsTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [meetingFilter, setMeetingFilter] = useState('')
  const [templateFilter, setTemplateFilter] = useState('')
  const [formatFilter, setFormatFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openDetail, setOpenDetail] = useState(false)
  const [openGenerate, setOpenGenerate] = useState(false)
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<Map<number, DownloadProgress>>(new Map())

  const { data, isLoading, refetch } = useGeneratedReports({
    page, 
    limit: 10,
    meetingId: meetingFilter,
    templateId: templateFilter,
    search
  })

  const { data: allTemplates } = useAllReportTemplates()
  const { mutateAsync: deleteGeneratedReport } = useDeleteGeneratedReport()
  
  // Sử dụng hook export chung
  const { 
    exportData, 
    exportShareholders, 
    exportRegistrations, 
    exportVotingResults, 
    exportAttendances,
    progress: globalProgress, 
    isExporting: globalIsExporting 
  } = useExportWithProgress()

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'PDF': 'red',
      'EXCEL': 'green',
      'CSV': 'blue',
      'HTML': 'orange'
    }
    return colors[format] || 'default'
  }

  const handleDownload = async (report: GeneratedReport) => {
    try {
      // Cập nhật trạng thái downloading
      setDownloadProgress(prev => new Map(prev).set(report.id, {
        loaded: 0,
        total: 0,
        percent: 0,
        fileName: `${report.reportName}.${report.reportFormat.toLowerCase()}`,
        status: 'downloading'
      }))

      // Xác định loại export dựa trên template type
      const templateType = report.template?.templateType
      let exportType = ''
      let filters = {}

      switch (templateType) {
        case 'SHAREHOLDER_ANALYSIS':
          exportType = 'SHAREHOLDERS'
          break
        case 'REGISTRATION_STATS':
          exportType = 'REGISTRATIONS'
          filters = { meetingId: report.meetingId }
          break
        case 'VOTING_RESULTS':
          exportType = 'VOTING_RESULTS'
          // Cần resolutionId từ report data, nếu không có thì sử dụng meetingId
          filters = { meetingId: report.meetingId }
          break
        case 'ATTENDANCE_REPORT':
          exportType = 'ATTENDANCES'
          filters = { meetingId: report.meetingId }
          break
        default:
          // Mặc định export dữ liệu chung
          exportType = 'SHAREHOLDERS'
      }

      // Sử dụng hook export chung
      const result = await exportData({
        type: exportType,
        filters,
        customFileName: `${report.reportName}.xlsx`
      })

      if (result?.success) {
        // Cập nhật trạng thái completed
        setDownloadProgress(prev => new Map(prev).set(report.id, {
          loaded: 100,
          total: 100,
          percent: 100,
          fileName: `${report.reportName}.xlsx`,
          status: 'completed'
        }))

        // Xóa progress sau 2 giây
        setTimeout(() => {
          setDownloadProgress(prev => {
            const newMap = new Map(prev)
            newMap.delete(report.id)
            return newMap
          })
        }, 2000)
      } else {
        throw new Error('Download failed')
      }

    } catch (error) {
      console.error('Download error:', error)
      
      // Cập nhật trạng thái error
      setDownloadProgress(prev => new Map(prev).set(report.id, {
        loaded: 0,
        total: 0,
        percent: 0,
        fileName: `${report.reportName}.xlsx`,
        status: 'error'
      }))

      // Xóa progress sau 3 giây
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev)
          newMap.delete(report.id)
          return newMap
        })
      }, 3000)
    }
  }

  const handleRegenerate = (report: GeneratedReport) => {
    setSelectedReport(report)
    setOpenGenerate(true)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProgressStatus = (status: DownloadProgress['status']) => {
    switch (status) {
      case 'downloading': return 'active'
      case 'completed': return 'success'
      case 'error': return 'exception'
      default: return 'normal'
    }
  }

  const getProgressColor = (status: DownloadProgress['status']) => {
    switch (status) {
      case 'completed': return '#52c41a'
      case 'error': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  const getTemplateTypeLabel = (templateType: string) => {
    const labels: Record<string, string> = {
      'MEETING_SUMMARY': 'Tổng Quan Cuộc Họp',
      'ATTENDANCE_REPORT': 'Báo Cáo Điểm Danh',
      'VOTING_RESULTS': 'Kết Quả Bỏ Phiếu',
      'REGISTRATION_STATS': 'Thống Kê Đăng Ký',
      'QUESTION_ANALYTICS': 'Phân Tích Câu Hỏi',
      'SHAREHOLDER_ANALYSIS': 'Báo Cáo Cổ Đông',
      'FINAL_SUMMARY': 'Tổng Kết Cuối'
    }
    return labels[templateType] || templateType
  }

  const columns: ColumnsType<GeneratedReport> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên báo cáo',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (name: string, record) => (
        <Space direction="vertical" size="small">
          <strong>{name}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getTemplateTypeLabel(record.template?.templateType || '')}
          </div>
          {downloadProgress.has(record.id) && (
            <div style={{ width: '100%' }}>
              <Progress
                percent={downloadProgress.get(record.id)?.percent || 0}
                status={getProgressStatus(downloadProgress.get(record.id)?.status || 'downloading')}
                strokeColor={getProgressColor(downloadProgress.get(record.id)?.status || 'downloading')}
                size="small"
                format={percent => {
                  const progress = downloadProgress.get(record.id)
                  if (!progress) return `${percent}%`
                  
                  switch (progress.status) {
                    case 'completed':
                      return '✅ Hoàn thành'
                    case 'error':
                      return '❌ Lỗi'
                    default:
                      return `${percent}%`
                  }
                }}
              />
              {downloadProgress.get(record.id)?.status === 'downloading' && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {formatFileSize(downloadProgress.get(record.id)?.loaded || 0)} / {formatFileSize(downloadProgress.get(record.id)?.total || 0)}
                </div>
              )}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Cuộc họp',
      dataIndex: 'meeting',
      key: 'meeting',
      render: (meeting: any) => meeting?.meetingName || '—',
    },
    {
      title: 'Mẫu báo cáo',
      dataIndex: 'template',
      key: 'template',
      render: (template: any) => template?.templateName || '—',
    },
    {
      title: 'Định dạng',
      dataIndex: 'reportFormat',
      key: 'reportFormat',
      render: (format: string) => (
        <Tag color={getFormatColor(format)}>
          {format}
        </Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'generatedByUser',
      key: 'generatedByUser',
      render: (user: any) => user?.name || '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => {
        const isDownloading = downloadProgress.has(record.id) && 
          downloadProgress.get(record.id)?.status === 'downloading'
        
        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedReport(record)
                  setOpenDetail(true)
                }}
              />
            </Tooltip>

            <Tooltip title={isDownloading ? "Đang tải xuống..." : "Tải xuống"}>
              {isDownloading ? (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<PauseOutlined />}
                  loading
                  style={{ color: '#faad14' }}
                />
              ) : (
                <DownloadOutlined
                  style={{ 
                    color: downloadProgress.get(record.id)?.status === 'completed' ? '#52c41a' : 
                           downloadProgress.get(record.id)?.status === 'error' ? '#ff4d4f' : '#52c41a',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  onClick={() => handleDownload(record)}
                />
              )}
            </Tooltip>

            <Tooltip title="Tạo lại">
              <ReloadOutlined
                style={{ color: '#faad14', cursor: 'pointer' }}
                onClick={() => handleRegenerate(record)}
              />
            </Tooltip>

            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ color: 'red', cursor: 'pointer' }}
                onClick={() => {
                  Modal.confirm({
                    title: 'Xác nhận xóa báo cáo',
                    content: `Bạn có chắc chắn muốn xóa báo cáo "${record.reportName}" không?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await deleteGeneratedReport(record.id)
                        message.success('Xóa báo cáo thành công')
                        refetch?.()
                      } catch (error: any) {
                        message.error(error?.response?.data?.message || 'Xóa thất bại')
                      }
                    },
                  })
                }}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const handleReset = () => {
    setInputValue('')
    setSearch('')
    setMeetingFilter('')
    setTemplateFilter('')
    setFormatFilter('')
    setPage(1)
  }

  // Hiển thị tổng quan download
  const activeDownloads = Array.from(downloadProgress.values()).filter(
    progress => progress.status === 'downloading'
  ).length

  return (
    <div>
      {/* Download Summary */}
      {activeDownloads > 0 && (
        <Card className="mb-4" style={{ borderLeft: '4px solid #1890ff' }}>
          <Row align="middle" gutter={16}>
            <Col>
              <DownloadOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </Col>
            <Col flex="auto">
              <div>
                <strong>Đang tải xuống {activeDownloads} báo cáo</strong>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Vui lòng đợi trong khi các báo cáo được tải xuống...
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Tìm kiếm & Bộ lọc */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm theo tên báo cáo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              className="w-[300px]"
            />
            <Select
              placeholder="Mẫu báo cáo"
              value={templateFilter || undefined}
              onChange={setTemplateFilter}
              allowClear
              style={{ width: 200 }}
            >
              {allTemplates?.map((template: any) => (
                <Option key={template.id} value={template.id.toString()}>
                  {template.templateName}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Định dạng"
              value={formatFilter || undefined}
              onChange={setFormatFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="PDF">PDF</Option>
              <Option value="EXCEL">Excel</Option>
              <Option value="CSV">CSV</Option>
              <Option value="HTML">HTML</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button onClick={handleReset}>
              Đặt lại
            </Button>
          </div>

          <Button 
            type="primary" 
            icon={<FileSearchOutlined />} 
            onClick={() => setOpenGenerate(true)}
          >
            Tạo Báo Cáo Mới
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} báo cáo`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1000 }}
      />

      <GeneratedReportDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        report={selectedReport}
      />

      <GenerateReportModal
        open={openGenerate}
        onClose={() => setOpenGenerate(false)}
        existingReport={selectedReport}
        refetch={refetch}
      />
    </div>
  )
}
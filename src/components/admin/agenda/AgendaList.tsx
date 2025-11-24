// src/components/admin/agenda/AgendaList.tsx
'use client'

import React from 'react'; 
import { Table, Tag, Space, Tooltip, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, FileOutlined } from '@ant-design/icons'
import { useUpdateAgenda } from '@/hooks/agenda/useUpdateAgenda'
import { useDeleteAgenda } from '@/hooks/agenda/useDeleteAgenda'
import { Agenda, AgendaStatus } from '@/types/agenda.type'

interface AgendaListProps {
  agendas: Agenda[]
  loading?: boolean
  onEdit: (agenda: Agenda) => void
  onRefresh: () => void
}

export default function AgendaList({ 
  agendas, 
  loading, 
  onEdit, 
  onRefresh 
}: AgendaListProps) {
  const { mutateAsync: updateAgenda } = useUpdateAgenda()
  const { mutateAsync: deleteAgenda } = useDeleteAgenda()

  const getStatusColor = (status: AgendaStatus) => {
    const colors: Record<AgendaStatus, string> = {
      [AgendaStatus.PENDING]: 'default',
      [AgendaStatus.ONGOING]: 'orange',
      [AgendaStatus.COMPLETED]: 'green',
      [AgendaStatus.CANCELLED]: 'red',
      [AgendaStatus.DELAYED]: 'volcano'
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status: AgendaStatus) => {
    const icons: Record<AgendaStatus, React.ReactElement> = {
      [AgendaStatus.PENDING]: <PauseCircleOutlined />,
      [AgendaStatus.ONGOING]: <PlayCircleOutlined />,
      [AgendaStatus.COMPLETED]: <CheckCircleOutlined />,
      [AgendaStatus.CANCELLED]: <PauseCircleOutlined />,
      [AgendaStatus.DELAYED]: <PauseCircleOutlined />
    }
    return icons[status]
  }

  const getStatusText = (status: AgendaStatus) => {
    const texts: Record<AgendaStatus, string> = {
      [AgendaStatus.PENDING]: 'Chờ thực hiện',
      [AgendaStatus.ONGOING]: 'Đang diễn ra',
      [AgendaStatus.COMPLETED]: 'Đã hoàn thành',
      [AgendaStatus.CANCELLED]: 'Đã hủy',
      [AgendaStatus.DELAYED]: 'Bị trì hoãn'
    }
    return texts[status]
  }

  const handleStatusChange = async (agenda: Agenda, status: AgendaStatus) => {
    try {
      await updateAgenda({
        id: agenda.id,
        status
      })
      message.success(`Đã cập nhật trạng thái thành ${getStatusText(status)}`)
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = async (agenda: Agenda) => {
    try {
      await deleteAgenda(agenda.id)
      message.success('Xóa chương trình nghị sự thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return '—';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return '—';
    return `${duration} phút`;
  }

  const columns: ColumnsType<Agenda> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã chương trình',
      dataIndex: 'agendaCode',
      key: 'agendaCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record) => (
        <Space direction="vertical" size="small">
          <div className="font-semibold">{title}</div>
          {record.description && (
            <div className="text-xs text-gray-500">
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description
              }
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Diễn giả',
      dataIndex: 'speaker',
      key: 'speaker',
      render: (speaker: string) => speaker || '—',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div className="text-sm">
            <span className="text-gray-600">Bắt đầu:</span>{' '}
            {formatTime(record.startTime)}
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Kết thúc:</span>{' '}
            {formatTime(record.endTime)}
          </div>
        </Space>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: formatDuration,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Tài liệu',
      dataIndex: 'presentationUrl',
      key: 'presentationUrl',
      width: 80,
      align: 'center' as const,
      render: (url: string) =>
        url ? (
          <Tooltip title="Có tài liệu trình chiếu">
            <FileOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: AgendaStatus, record: Agenda) => (
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
          className="cursor-pointer"
          onClick={() => {
            // Cycle through statuses
            const statuses: AgendaStatus[] = [
              AgendaStatus.PENDING,
              AgendaStatus.ONGOING,
              AgendaStatus.COMPLETED,
              AgendaStatus.CANCELLED
            ];
            const currentIndex = statuses.indexOf(status);
            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
            handleStatusChange(record, nextStatus);
          }}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={
                <div>
                <div>Xác nhận xóa</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Bạn có chắc chắn muốn xóa chương trình nghị sự này?
                </div>
                </div>
            }
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ color: 'red', cursor: 'pointer' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={agendas}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 1200 }}
    />
  )
}
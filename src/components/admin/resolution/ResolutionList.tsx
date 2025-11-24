// src/components/admin/resolution/ResolutionList.tsx
'use client'

import { Table, Tag, Space, Tooltip, Button, Switch, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, BarChartOutlined, UserOutlined, SettingOutlined, FormOutlined } from '@ant-design/icons'
import { useUpdateResolution } from '@/hooks/resolution/useUpdateResolution'
import { useDeleteResolution } from '@/hooks/resolution/useDeleteResolution'
import { Resolution, VotingMethod, ResolutionType } from '@/types/resolution.type'
import { useRouter } from 'next/navigation'

interface ResolutionListProps {
  resolutions: Resolution[]
  loading?: boolean
  onEdit: (resolution: Resolution) => void
  onRefresh: () => void
}

export default function ResolutionList({ 
  resolutions, 
  loading, 
  onEdit, 
  onRefresh 
}: ResolutionListProps) {
  const { mutateAsync: updateResolution } = useUpdateResolution()
  const { mutateAsync: deleteResolution } = useDeleteResolution()
   const router = useRouter();
  const getVotingMethodColor = (method: VotingMethod) => {
    const colors: Record<VotingMethod, string> = {
      [VotingMethod.YES_NO]: 'blue',
      [VotingMethod.MULTIPLE_CHOICE]: 'green',
      [VotingMethod.RANKING]: 'orange'
    }
    return colors[method] || 'default'
  }

  const getVotingMethodText = (method: VotingMethod) => {
    const texts: Record<VotingMethod, string> = {
      [VotingMethod.YES_NO]: 'Có/Không',
      [VotingMethod.MULTIPLE_CHOICE]: 'Nhiều lựa chọn',
      [VotingMethod.RANKING]: 'Xếp hạng'
    }
    return texts[method]
  }

  const getResolutionTypeColor = (type: ResolutionType) => {
    const colors: Record<string, string> = {
      ELECTION: 'purple',
      APPROVAL: 'cyan',
      POLICY: 'gold',
      OTHER: 'default'
    }
    return colors[type] || 'default'
  }

  const handleStatusChange = async (resolution: Resolution, isActive: boolean) => {
    try {
      await updateResolution({
        id: resolution.id,
        isActive
      })
      message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} nghị quyết`)
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = async (resolution: Resolution) => {
    try {
      await deleteResolution(resolution.id)
      message.success('Xóa nghị quyết thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<Resolution> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã nghị quyết',
      dataIndex: 'resolutionCode',
      key: 'resolutionCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Số nghị quyết',
      dataIndex: 'resolutionNumber',
      key: 'resolutionNumber',
      width: 100,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <span>{title}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'resolutionType',
      key: 'resolutionType',
      render: (type: string) => (
        <Tag color={getResolutionTypeColor(type as ResolutionType)}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Phương thức bỏ phiếu',
      dataIndex: 'votingMethod',
      key: 'votingMethod',
      render: (method: VotingMethod) => (
        <Tag color={getVotingMethodColor(method)}>
          {getVotingMethodText(method)}
        </Tag>
      ),
    },
    {
      title: 'Ngưỡng chấp thuận',
      dataIndex: 'approvalThreshold',
      key: 'approvalThreshold',
      render: (threshold: number) => `${threshold}%`,
    },
    {
      title: 'Tổng phiếu',
      dataIndex: 'totalVotes',
      key: 'totalVotes',
      render: (votes: number) => (
        <div className="text-center">
          <div className="font-semibold">{votes}</div>
          <div className="text-xs text-gray-500">phiếu</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Resolution) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
            {record.votingMethod === 'RANKING' ? (
                <Tooltip title="Ứng cử viên">
                <UserOutlined
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/resolutions/${record.id}/candidates`)}
                />
                </Tooltip>
            ) : (
                <Tooltip title="Phương án bỏ phiếu">
                <FormOutlined 
                    style={{ color: '#52c41a', cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/resolutions/${record.id}/options`)}
                />
                </Tooltip>
            )}
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
                    Bạn có chắc chắn muốn xóa nghị quyết này?
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
      dataSource={resolutions}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 1000 }}
    />
  )
}
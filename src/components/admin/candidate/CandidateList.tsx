// src/components/admin/candidate/CandidateList.tsx
'use client'

import { Table, Tag, Space, Tooltip, Button, Switch, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons'
import { useUpdateCandidate } from '@/hooks/candidate/useUpdateCandidate'
import { useDeleteCandidate } from '@/hooks/candidate/useDeleteCandidate'
import type { ResolutionCandidate } from '@/types/candidate.type'

interface CandidateListProps {
  candidates: ResolutionCandidate[]
  loading?: boolean
  onEdit: (candidate: ResolutionCandidate) => void
  onRefresh: () => void
}

export default function CandidateList({ 
  candidates, 
  loading, 
  onEdit, 
  onRefresh 
}: CandidateListProps) {
  const { mutateAsync: updateCandidate } = useUpdateCandidate()
  const { mutateAsync: deleteCandidate } = useDeleteCandidate()

  const handleElectionStatusChange = async (candidate: ResolutionCandidate, isElected: boolean) => {
    try {
      await updateCandidate({
        id: candidate.id,
        isElected
      })
      message.success(`Đã ${isElected ? 'đánh dấu trúng cử' : 'bỏ đánh dấu trúng cử'} cho ứng cử viên`)
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = async (candidate: ResolutionCandidate) => {
    try {
      await deleteCandidate(candidate.id)
      message.success('Xóa ứng cử viên thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<ResolutionCandidate> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã ứng cử viên',
      dataIndex: 'candidateCode',
      key: 'candidateCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Tên ứng cử viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      ellipsis: true,
      render: (name: string, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Tooltip title={name}>
            <span>{name}</span>
          </Tooltip>
          {record.isElected && (
            <TrophyOutlined style={{ color: '#faad14' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Thông tin',
      dataIndex: 'candidateInfo',
      key: 'candidateInfo',
      ellipsis: true,
      render: (info: string) => (
        <Tooltip title={info}>
          <span className="text-gray-600">{info || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Số phiếu',
      dataIndex: 'voteCount',
      key: 'voteCount',
      width: 100,
      render: (votes: number) => (
        <div className="text-center">
          <div className="font-semibold">{votes.toLocaleString()}</div>
          <div className="text-xs text-gray-500">phiếu</div>
        </div>
      ),
    },
    {
      title: 'Trúng cử',
      dataIndex: 'isElected',
      key: 'isElected',
      width: 100,
      render: (isElected: boolean, record: ResolutionCandidate) => (
        <Switch
          checked={isElected}
          onChange={(checked) => handleElectionStatusChange(record, checked)}
          checkedChildren="✓"
          unCheckedChildren="✗"
        />
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
                    Bạn có chắc chắn muốn xóa ứng cử viên này?
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
      dataSource={candidates}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 800 }}
    />
  )
}
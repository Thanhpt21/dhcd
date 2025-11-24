// src/components/admin/vote/VoteList.tsx
'use client'

import { Table, Tag, Space, Tooltip, Popconfirm, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useDeleteVote } from '@/hooks/vote/useDeleteVote'
import { Vote, VotingMethod } from '@/types/vote.type'
import { useResolutions } from '@/hooks/resolution/useResolutions'
import { useState } from 'react'
import VoteDetailModal from './VoteDetailModal'

const { Option } = Select

interface VoteListProps {
  votes: Vote[]
  loading?: boolean
  onRefresh: () => void
  onResolutionChange: (resolutionId: number | undefined) => void
  currentResolutionId?: number
}

export default function VoteList({ 
  votes, 
  loading, 
  onRefresh,
  onResolutionChange,
  currentResolutionId
}: VoteListProps) {
  const { mutateAsync: deleteVote } = useDeleteVote()
  const { data: resolutionsData } = useResolutions()
  const [voteDetailModalOpen, setVoteDetailModalOpen] = useState(false)
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null)

    const handleViewDetail = (voteId: number) => {
    setSelectedVoteId(voteId)
    setVoteDetailModalOpen(true)
  }



  const getVoteValueColor = (value: string, votingMethod?: VotingMethod) => {
    if (!votingMethod) return 'default';
    
    if (votingMethod === VotingMethod.YES_NO) {
        const colors: Record<string, string> = {
        'YES': 'green',
        'NO': 'red',
        'ABSTAIN': 'orange'
        }
        return colors[value] || 'default'
    }
    return 'blue'
    }

    const getVoteValueText = (value: string, votingMethod?: VotingMethod) => {
    if (!votingMethod) return value;
    
    if (votingMethod === VotingMethod.YES_NO) {
        const texts: Record<string, string> = {
        'YES': 'Đồng ý',
        'NO': 'Không đồng ý',
        'ABSTAIN': 'Không ý kiến'
        }
        return texts[value] || value
    }
    
    try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
        return `Đã chọn ${parsed.length} lựa chọn`
        } else if (typeof parsed === 'object') {
        return `Xếp hạng ${Object.keys(parsed).length} ứng cử viên`
        }
    } catch {
        return value
    }
    
    return value
    }

  const getVotingMethodColor = (method?: VotingMethod) => {
    if (!method) return 'default';
    
    const colors: Record<VotingMethod, string> = {
        [VotingMethod.YES_NO]: 'blue',
        [VotingMethod.MULTIPLE_CHOICE]: 'green',
        [VotingMethod.RANKING]: 'orange'
    }
    return colors[method] || 'default'
    }

    const getVotingMethodText = (method?: VotingMethod) => {
    if (!method) return 'Không xác định';
    
    const texts: Record<VotingMethod, string> = {
        [VotingMethod.YES_NO]: 'Có/Không',
        [VotingMethod.MULTIPLE_CHOICE]: 'Nhiều lựa chọn',
        [VotingMethod.RANKING]: 'Xếp hạng'
    }
    return texts[method]
    }

  const handleDelete = async (vote: Vote) => {
    try {
      await deleteVote(vote.id)
      message.success('Xóa phiếu bầu thành công')
      onRefresh?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<Vote> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã cổ đông',
      dataIndex: ['shareholder', 'shareholderCode'],
      key: 'shareholderCode',
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Tên cổ đông',
      dataIndex: ['shareholder', 'fullName'],
      key: 'shareholderName',
      ellipsis: true,
    },
    {
      title: 'Nghị quyết',
      dataIndex: ['resolution', 'title'],
      key: 'resolutionTitle',
      ellipsis: true,
      render: (title: string, record) => (
        <Space direction="vertical" size="small">
          <div className="font-semibold">{title}</div>
          <div className="flex gap-2">
            <Tag color="blue">{record.resolution?.resolutionCode}</Tag>
            <Tag color={getVotingMethodColor(record.resolution?.votingMethod)}>
              {getVotingMethodText(record.resolution?.votingMethod)}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá trị bỏ phiếu',
      dataIndex: 'voteValue',
      key: 'voteValue',
      render: (value: string, record) => (
        <Tag color={getVoteValueColor(value, record.resolution?.votingMethod)}>
          {getVoteValueText(value, record.resolution?.votingMethod)}
        </Tag>
      ),
    },
    {
      title: 'Cổ phần sử dụng',
      dataIndex: 'sharesUsed',
      key: 'sharesUsed',
      render: (shares: number) => (
        <div className="text-center">
          <div className="font-semibold">{shares.toLocaleString()}</div>
          <div className="text-xs text-gray-500">cổ phần</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString('vi-VN')}>
          <span className="text-sm">
            {new Date(date).toLocaleDateString('vi-VN')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
           <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Popconfirm
           title={
                <div>
                <div>Xác nhận xóa</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Bạn có chắc chắn muốn xóa phiếu bầu này?
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
    <div className="space-y-4">
      {/* Resolution Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Lọc theo nghị quyết:</span>
          <Select
            placeholder="Chọn nghị quyết"
            value={currentResolutionId}
            onChange={onResolutionChange}
            allowClear
            style={{ width: 300 }}
          >
            {resolutionsData?.data.map((resolution: any) => (
              <Option key={resolution.id} value={resolution.id}>
                {resolution.resolutionCode} - {resolution.title}
              </Option>
            ))}
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          Hiển thị {votes.length} phiếu bầu
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={votes}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
      />

       <VoteDetailModal
        open={voteDetailModalOpen}
        onClose={() => {
          setVoteDetailModalOpen(false)
          setSelectedVoteId(null)
        }}
        voteId={selectedVoteId}
      />
    </div>
  )
}
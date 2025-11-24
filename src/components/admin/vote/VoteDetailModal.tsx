// src/components/admin/vote/VoteDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Space, Card, Divider, Empty } from 'antd'
import { useVoteDetail } from '@/hooks/vote/useVoteDetail'
import type { Vote, VotingMethod } from '@/types/vote.type'
import { 
  UserOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  EnvironmentOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface VoteDetailModalProps {
  open: boolean
  onClose: () => void
  voteId: number | null
}

export default function VoteDetailModal({
  open,
  onClose,
  voteId
}: VoteDetailModalProps) {
  const { data: voteResponse, isLoading } = useVoteDetail(voteId || 0)
  
  // Lấy data từ response
  const vote = voteResponse?.data

  const getVotingMethodColor = (method?: VotingMethod) => {
    if (!method) return 'default';
    const colors: Record<VotingMethod, string> = {
      YES_NO: 'blue',
      MULTIPLE_CHOICE: 'green',
      RANKING: 'orange'
    }
    return colors[method] || 'default'
  }

  const getVotingMethodText = (method?: VotingMethod) => {
    if (!method) return 'Không xác định';
    const texts: Record<VotingMethod, string> = {
      YES_NO: 'Bỏ phiếu Có/Không',
      MULTIPLE_CHOICE: 'Nhiều lựa chọn',
      RANKING: 'Xếp hạng'
    }
    return texts[method]
  }

  const getVoteValueColor = (value: string, votingMethod?: VotingMethod) => {
    if (!votingMethod) return 'default';
    
    if (votingMethod === 'YES_NO') {
      const colors: Record<string, string> = {
        'YES': 'green',
        'NO': 'red',
        'ABSTAIN': 'orange'
      }
      return colors[value] || 'default'
    }
    return 'blue'
  }

  const getVoteValueDisplay = (vote: any) => {
  // Sử dụng displayValue từ backend nếu có
  if (vote.displayValue) {
    return (
      <div className="p-3 bg-white border rounded-lg">
        <div className="text-sm font-semibold text-gray-800">
          {vote.displayValue}
        </div>
        {/* {vote.rawVoteValue && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Giá trị gốc:</span>{' '}
            <code>{vote.rawVoteValue}</code>
          </div>
        )} */}
      </div>
    )
  }

  // Fallback: parse thủ công nếu không có displayValue
  const { voteValue, resolution } = vote
  if (!resolution?.votingMethod) return voteValue;

  try {
    if (resolution.votingMethod === 'MULTIPLE_CHOICE') {
      const selectedIds = JSON.parse(voteValue)
      if (Array.isArray(selectedIds)) {
        return (
          <div className="p-3 bg-white border rounded-lg">
            <div className="font-semibold mb-2 text-gray-800">
              Đã chọn {selectedIds.length} lựa chọn:
            </div>
            <Space wrap>
              {selectedIds.map((id: string) => (
                <Tag key={id} color="green">
                  {id}
                </Tag>
              ))}
            </Space>
          </div>
        )
      }
    } else if (resolution.votingMethod === 'RANKING') {
      const rankingData = JSON.parse(voteValue)
      if (typeof rankingData === 'object' && rankingData !== null) {
        // XÁC ĐỊNH KIỂU RÕ RÀNG
        const entries = Object.entries(rankingData) as [string, number][];
        
        return (
          <div className="p-3 bg-white border rounded-lg">
            <div className="font-semibold mb-2 text-gray-800">
              Xếp hạng {entries.length} ứng cử viên:
            </div>
            <Space direction="vertical" size="small">
              {entries
                .sort(([,a], [,b]) => a - b)
                .map(([code, rank]) => (
                  <div key={code} className="flex items-center gap-2">
                    <Tag color="orange">Hạng {rank}</Tag>
                    <span>{code}</span>
                  </div>
                ))}
            </Space>
          </div>
        )
      }
    } else if (resolution.votingMethod === 'YES_NO') {
      const texts: Record<string, string> = {
        'YES': '✅ Đồng ý',
        'NO': '❌ Không đồng ý', 
        'ABSTAIN': '⚪ Không ý kiến'
      }
      return (
        <div className="p-3 bg-white border rounded-lg">
          <div className="text-lg font-semibold text-gray-800">
            {texts[voteValue] || voteValue}
          </div>
        </div>
      )
    }
  } catch {
    // Nếu parse lỗi, hiển thị giá trị gốc
  }

  return (
    <div className="p-3 bg-white border rounded-lg">
      <code>{voteValue}</code>
    </div>
  )
}

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss')
  }

  if (!voteId) {
    return null
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined />
          <span>Chi tiết Phiếu bầu</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div>Đang tải...</div>
        </div>
      ) : vote ? (
        <div className="space-y-6">
          {/* Thông tin chung */}
          <Card>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã phiếu bầu" span={2}>
                <Tag color="blue">VOTE-{vote.id.toString().padStart(4, '0')}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian bỏ phiếu">
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>{formatDateTime(vote.createdAt)}</span>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Số cổ phần sử dụng">
                <div className="flex items-center gap-1">
                  <BarChartOutlined />
                  <span>{vote.sharesUsed.toLocaleString()} cổ phần</span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin Nghị quyết */}
          <Card title="Thông tin Nghị quyết">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã nghị quyết">
                <strong>{vote.resolution?.resolutionCode}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề">
                {vote.resolution?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức bỏ phiếu">
                <Tag color={getVotingMethodColor(vote.resolution?.votingMethod)}>
                  {getVotingMethodText(vote.resolution?.votingMethod)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin Cổ đông */}
          <Card title="Thông tin Cổ đông">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Mã cổ đông">
                <div className="flex items-center gap-1">
                  <UserOutlined />
                  <strong>{vote.shareholder?.shareholderCode}</strong>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Tên cổ đông">
                {vote.shareholder?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số cổ phần">
                {vote.shareholder?.totalShares.toLocaleString()} cổ phần
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Kết quả bỏ phiếu - SỬA PHẦN NÀY */}
          <Card title="Kết quả Bỏ phiếu">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Phương thức:</span>
                <Tag color={getVotingMethodColor(vote.resolution?.votingMethod)}>
                  {getVotingMethodText(vote.resolution?.votingMethod)}
                </Tag>
              </div>
              
              <div className="font-semibold text-gray-700">Kết quả:</div>
              {getVoteValueDisplay(vote)}
            </div>
          </Card>

          {/* Thông tin kỹ thuật */}
          {(vote.ipAddress || vote.userAgent) && (
            <Card title="Thông tin Kỹ thuật">
              <Descriptions column={1} size="small">
                {vote.ipAddress && (
                  <Descriptions.Item label="Địa chỉ IP">
                    <code>{vote.ipAddress}</code>
                  </Descriptions.Item>
                )}
                {vote.userAgent && (
                  <Descriptions.Item label="Thiết bị">
                    <code className="text-xs">{vote.userAgent}</code>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin phiếu bầu" />
      )}
    </Modal>
  )
}
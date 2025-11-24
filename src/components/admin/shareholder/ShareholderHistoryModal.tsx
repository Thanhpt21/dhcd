// src/components/admin/shareholder/ShareholderHistoryModal.tsx
'use client'

import { Modal, Table, Tag, Spin, Empty, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useShareholderHistory } from '@/hooks/shareholder/useShareholderHistory'
import type { Shareholder, ShareholderShareHistory } from '@/types/shareholder.type'
import { HistoryOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface ShareholderHistoryModalProps {
  open: boolean
  onClose: () => void
  shareholder: Shareholder | null
}

export const ShareholderHistoryModal = ({
  open,
  onClose,
  shareholder,
}: ShareholderHistoryModalProps) => {
  const { data: histories, isLoading } = useShareholderHistory(
    shareholder?.id || 0,
    { enabled: open && !!shareholder }
  )

  const getChangeTypeColor = (changeType: string) => {
    const colors: Record<string, string> = {
      INCREASE: 'green',
      DECREASE: 'red',
      TRANSFER: 'orange',
      ADJUSTMENT: 'blue',
      INITIAL: 'purple' // Thêm INITIAL
    }
    return colors[changeType] || 'default'
  }

  const getChangeTypeText = (changeType: string) => {
    const texts: Record<string, string> = {
      INCREASE: 'Tăng',
      DECREASE: 'Giảm',
      TRANSFER: 'Chuyển nhượng',
      ADJUSTMENT: 'Điều chỉnh',
      INITIAL: 'Khởi tạo' // Thêm INITIAL
    }
    return texts[changeType] || changeType
  }

  const columns: ColumnsType<ShareholderShareHistory> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Ngày thay đổi',
      dataIndex: 'changeDate',
      key: 'changeDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trước',
      dataIndex: 'sharesBefore',
      key: 'sharesBefore',
      render: (shares: number) => shares.toLocaleString(),
    },
    {
      title: 'Sau',
      dataIndex: 'sharesAfter',
      key: 'sharesAfter',
      render: (shares: number) => shares.toLocaleString(),
    },
    {
      title: 'Thay đổi',
      dataIndex: 'changeAmount',
      key: 'changeAmount',
      render: (amount: number, record: ShareholderShareHistory) => (
        <Tag color={getChangeTypeColor(record.changeType)}>
          {['INCREASE', 'INITIAL'].includes(record.changeType) ? '+' : ''}{amount.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'Loại thay đổi',
      dataIndex: 'changeType',
      key: 'changeType',
      render: (changeType: string) => (
        <Tag color={getChangeTypeColor(changeType)}>
          {getChangeTypeText(changeType)}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '—',
    },
  ]

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <HistoryOutlined />
          <span>Lịch sử cổ phần - {shareholder?.fullName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={900}
      destroyOnClose
    >
      {shareholder && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">{shareholder.shareholderCode}</div>
              <div className="text-sm text-gray-600">{shareholder.fullName}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {shareholder.totalShares.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Tổng cổ phần hiện tại</div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : histories && histories.length > 0 ? (
            <Table
              columns={columns}
              dataSource={histories}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
            />
          ) : (
            <Empty description="Không có lịch sử cổ phần" />
          )}
        </div>
      )}
    </Modal>
  )
}
// src/components/admin/proxy/ProxyDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Spin, Empty, Button } from 'antd'
import type { Proxy, ProxyStatus } from '@/types/proxy.type'
import { 
  TeamOutlined, 
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface ProxyDetailModalProps {
  open: boolean
  onClose: () => void
  proxy: Proxy | null
}

export const ProxyDetailModal = ({
  open,
  onClose,
  proxy,
}: ProxyDetailModalProps) => {
  const getStatusColor = (status: ProxyStatus) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
      REVOKED: 'gray',
      EXPIRED: 'default'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: ProxyStatus) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
      REVOKED: 'Đã thu hồi',
      EXPIRED: 'Đã hết hạn'
    }
    return texts[status] || status
  }

  const formatDate = (dateString?: string) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY HH:mm') : '—'
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TeamOutlined />
          <span>Chi tiết ủy quyền</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={700}
      destroyOnClose
    >
      {proxy ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Ủy quyền #{proxy.id}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color={getStatusColor(proxy.status)}>
                    {getStatusText(proxy.status)}
                  </Tag>
                  <Tag color="blue">{proxy.shares.toLocaleString()} cổ phần</Tag>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Cuộc họp</div>
                <div className="font-medium">{proxy.meeting?.meetingCode}</div>
              </div>
            </div>
          </div>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Cuộc họp">
              <div className="flex flex-col">
                <strong>{proxy.meeting?.meetingCode}</strong>
                <span className="text-sm text-gray-600">{proxy.meeting?.meetingName}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Cổ đông ủy quyền">
              <div className="flex flex-col">
                <strong>{proxy.shareholder?.fullName}</strong>
                <span className="text-sm text-gray-600">
                  {proxy.shareholder?.shareholderCode} • {proxy.shareholder?.email}
                </span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Người nhận ủy quyền">
              <div className="flex flex-col">
                <strong>{proxy.proxyPerson?.fullName}</strong>
                <span className="text-sm text-gray-600">
                  {proxy.proxyPerson?.shareholderCode} • {proxy.proxyPerson?.email}
                </span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Số cổ phần ủy quyền">
              <strong className="text-blue-600">{proxy.shares.toLocaleString()}</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Thời hạn ủy quyền">
              <div className="flex items-center gap-1">
                <CalendarOutlined />
                <span>Từ {formatDate(proxy.startDate)} đến {formatDate(proxy.endDate)}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Lý do">
              {proxy.reason || '—'}
            </Descriptions.Item>

            {proxy.documentUrl && (
              <Descriptions.Item label="Tài liệu">
                <div className="flex items-center gap-1">
                  <FileTextOutlined />
                  <a href={proxy.documentUrl} target="_blank" rel="noopener noreferrer">
                    Xem tài liệu
                  </a>
                </div>
              </Descriptions.Item>
            )}

            {proxy.rejectedReason && (
              <Descriptions.Item label="Lý do từ chối">
                <span className="text-red-600">{proxy.rejectedReason}</span>
              </Descriptions.Item>
            )}

            {proxy.approvedByUser && (
              <Descriptions.Item label="Người duyệt">
                {proxy.approvedByUser?.name} ({proxy.approvedByUser?.email})
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Ngày tạo">
              {formatDate(proxy.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(proxy.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin ủy quyền" />
      )}
    </Modal>
  )
}
// src/components/admin/shareholder/ShareholderDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Spin, Empty, Button } from 'antd'
import type { Shareholder } from '@/types/shareholder.type'
import { 
  UserOutlined, 
  IdcardOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface ShareholderDetailModalProps {
  open: boolean
  onClose: () => void
  shareholder: Shareholder | null
}

export const ShareholderDetailModal = ({
  open,
  onClose,
  shareholder,
}: ShareholderDetailModalProps) => {
  const getGenderText = (gender?: string) => {
    const texts: Record<string, string> = {
      MALE: 'Nam',
      FEMALE: 'Nữ',
      OTHER: 'Khác'
    }
    return texts[gender || ''] || gender
  }

  const getShareTypeText = (shareType: string) => {
    const texts: Record<string, string> = {
      COMMON: 'Cổ phần phổ thông',
      PREFERRED: 'Cổ phần ưu đãi'
    }
    return texts[shareType] || shareType
  }

  const formatDate = (dateString?: string) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY') : '—'
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Chi tiết cổ đông</span>
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
      {shareholder ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {shareholder.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color="blue">{shareholder.shareholderCode}</Tag>
                  <Tag color={shareholder.isActive ? 'green' : 'red'}>
                    {shareholder.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                  </Tag>
                  <Tag color="purple">{getShareTypeText(shareholder.shareType)}</Tag>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {shareholder.totalShares.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">cổ phần</div>
              </div>
            </div>
          </div>

          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Số CMND/CCCD" span={2}>
              <div className="flex items-center gap-1">
                <IdcardOutlined />
                <span>{shareholder.idNumber}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày cấp">
              {formatDate(shareholder.idIssueDate)}
            </Descriptions.Item>

            <Descriptions.Item label="Nơi cấp">
              {shareholder.idIssuePlace || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày sinh">
              {formatDate(shareholder.dateOfBirth)}
            </Descriptions.Item>

            <Descriptions.Item label="Giới tính">
              {shareholder.gender ? getGenderText(shareholder.gender) : '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Quốc tịch">
              {shareholder.nationality || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Email" span={2}>
              <div className="flex items-center gap-1">
                <MailOutlined />
                <span>{shareholder.email}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              <div className="flex items-center gap-1">
                <PhoneOutlined />
                <span>{shareholder.phoneNumber || '—'}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Mã số thuế">
              {shareholder.taxCode || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ" span={2}>
              <div className="flex items-center gap-1">
                <EnvironmentOutlined />
                <span>{shareholder.address || '—'}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Số tài khoản">
              <div className="flex items-center gap-1">
                <BankOutlined />
                <span>{shareholder.bankAccount || '—'}</span>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Ngân hàng">
              {shareholder.bankName || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {formatDate(shareholder.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(shareholder.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin cổ đông" />
      )}
    </Modal>
  )
}
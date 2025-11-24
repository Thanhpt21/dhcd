// src/components/admin/meeting-setting/MeetingSettingDetailModal.tsx
'use client'

import { Modal, Descriptions, Tag, Spin, Empty, Button } from 'antd'
import type { MeetingSetting, DataType } from '@/types/meeting-setting.type'
import { 
  SettingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons'
import dayjs from 'dayjs'

interface MeetingSettingDetailModalProps {
  open: boolean
  onClose: () => void
  setting: MeetingSetting | null
}

export const MeetingSettingDetailModal = ({
  open,
  onClose,
  setting,
}: MeetingSettingDetailModalProps) => {
  const getDataTypeColor = (dataType: DataType) => {
    const colors: Record<DataType, string> = {
      STRING: 'blue',
      NUMBER: 'green',
      BOOLEAN: 'orange',
      JSON: 'purple',
      DATE: 'cyan'
    }
    return colors[dataType] || 'default'
  }

  const getDataTypeText = (dataType: DataType) => {
    const texts: Record<DataType, string> = {
      STRING: 'Chuỗi',
      NUMBER: 'Số',
      BOOLEAN: 'Boolean',
      JSON: 'JSON',
      DATE: 'Ngày'
    }
    return texts[dataType] || dataType
  }

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined />
          <span>Chi tiết cài đặt</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
      {setting ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {setting.key}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color="blue">Cuộc họp #{setting.meetingId}</Tag>
                  <Tag color={getDataTypeColor(setting.dataType)}>
                    {getDataTypeText(setting.dataType)}
                  </Tag>
                  {setting.isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Đang hoạt động
                    </Tag>
                  ) : (
                    <Tag color="red" icon={<CloseCircleOutlined />}>
                      Đã tắt
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã cuộc họp">
              <strong>#{setting.meetingId}</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Khóa">
              <code>{setting.key}</code>
            </Descriptions.Item>

            <Descriptions.Item label="Giá trị">
              {setting.dataType === 'BOOLEAN' ? (
                <Tag color={setting.value === 'true' ? 'green' : 'red'}>
                  {setting.value === 'true' ? 'Có' : 'Không'}
                </Tag>
              ) : (
                <span>{setting.value}</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Kiểu dữ liệu">
              <Tag color={getDataTypeColor(setting.dataType)}>
                {getDataTypeText(setting.dataType)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả">
              {setting.description || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {setting.isActive ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Đang hoạt động
                </Tag>
              ) : (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                  Đã tắt
                </Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(setting.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDateTime(setting.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin cài đặt" />
      )}
    </Modal>
  )
}
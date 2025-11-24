// src/components/admin/option/OptionManagement.tsx
'use client'

import { useState } from 'react'
import { Card, Tabs, Button, Space, message, Row, Col, Statistic, Alert, Tag } from 'antd'
import { PlusOutlined, BarChartOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useResolutionOptions } from '@/hooks/option/useResolutionOptions'
import { useOptionStatistics } from '@/hooks/option/useOptionStatistics'
import OptionList from './OptionList'
import OptionForm from './OptionForm'
import OptionStatistics from './OptionStatistics'
import type { ResolutionOption } from '@/types/option.type'

interface OptionManagementProps {
  resolutionId: number
  resolutionCode: string
  resolutionTitle: string
  votingMethod: string
}

export default function OptionManagement({ 
  resolutionId, 
  resolutionCode, 
  resolutionTitle,
  votingMethod 
}: OptionManagementProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedOption, setSelectedOption] = useState<ResolutionOption | null>(null)

  const { data: options, isLoading, refetch } = useResolutionOptions(resolutionId)
  const { data: statistics } = useOptionStatistics(resolutionId)

  const handleCreateSuccess = () => {
    setOpenCreate(false)
    refetch?.()
    message.success('Tạo phương án thành công')
  }

  const handleUpdateSuccess = () => {
    setSelectedOption(null)
    refetch?.()
    message.success('Cập nhật phương án thành công')
  }

  const getVotingMethodText = (method: string) => {
    const methods: Record<string, string> = {
      'YES_NO': 'Có/Không',
      'MULTIPLE_CHOICE': 'Nhiều lựa chọn',
      'RANKING': 'Xếp hạng'
    }
    return methods[method] || method
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <SettingOutlined />
          <span>Danh sách Phương án</span>
        </Space>
      ),
      children: (
        <OptionList
          options={options || []}
          loading={isLoading}
          onEdit={setSelectedOption}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: 'statistics',
      label: (
        <Space>
          <BarChartOutlined />
          <span>Thống kê Bỏ phiếu</span>
        </Space>
      ),
      children: <OptionStatistics resolutionId={resolutionId} />,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {resolutionTitle}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="text-gray-600">Mã nghị quyết:</span>
                <span className="font-semibold ml-2">{resolutionCode}</span>
              </div>
              <Tag color="purple">
                {getVotingMethodText(votingMethod)}
              </Tag>
              {statistics?.topOption && (
                <Tag color="gold">
                  Dẫn đầu: {statistics.topOption.optionText}
                </Tag>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tổng phương án</div>
            <div className="text-2xl font-bold text-blue-600">
              {options?.length || 0}
            </div>
          </div>
        </div>
      </Card>

      {/* Alert for empty options */}
      {options?.length === 0 && activeTab === 'list' && (
        <Alert
          message="Chưa có phương án bỏ phiếu nào"
          description={`Hãy thêm phương án bỏ phiếu đầu tiên cho loại "${getVotingMethodText(votingMethod)}".`}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => setOpenCreate(true)}>
              Thêm ngay
            </Button>
          }
        />
      )}


      <Card
        title="Quản lý Phương án Bỏ phiếu"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Thêm Phương án
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Create Modal */}
      <OptionForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleCreateSuccess}
        resolutionId={resolutionId}
      />

      {/* Update Modal */}
      <OptionForm
        open={!!selectedOption}
        onClose={() => setSelectedOption(null)}
        onSuccess={handleUpdateSuccess}
        resolutionId={resolutionId}
        option={selectedOption}
        isEdit
      />
    </div>
  )
}
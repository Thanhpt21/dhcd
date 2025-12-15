// src/components/admin/meeting/MeetingShareholdersModal.tsx
'use client'

import { Modal, Card, Statistic, Row, Col, Table, Tag, Space, Descriptions, Dropdown, Button, MenuProps } from 'antd'
import { PrinterOutlined, FileTextOutlined, UserOutlined, AuditOutlined, MoreOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useMeetingShareholders } from '@/hooks/meeting/useMeetingShareholders'
import { useMeetingPrint } from '@/hooks/meeting/useMeetingPrint'
import type { Meeting } from '@/types/meeting.type'

interface MeetingShareholdersModalProps {
  open: boolean
  onClose: () => void
  meeting: Meeting | null
}

export const MeetingStatisticsModal = ({
  open,
  onClose,
  meeting,
}: MeetingShareholdersModalProps) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState('')

  const { data, isLoading, error } = useMeetingShareholders(meeting?.id)
  const { printVotingBallot, printAttendanceCard, printElectionBallot, isPrinting } = useMeetingPrint()

  const getRegistrationTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'IN_PERSON': 'Trực tiếp',
      'PROXY': 'Ủy quyền'
    }
    return typeMap[type] || type
  }

  const getRegistrationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'IN_PERSON': 'blue',
      'ONLINE': 'green',
      'PROXY': 'orange'
    }
    return colors[type] || 'default'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'CANCELLED': 'Đã hủy',
      'CHECKED_IN': 'Đã check-in'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'yellow',
      'CONFIRMED': 'blue',
      'CANCELLED': 'red',
      'CHECKED_IN': 'green'
    }
    return colors[status] || 'default'
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Mã đại biểu',
      dataIndex: 'registrationCode',
      key: 'registrationCode',
      width: 150,
    },
    {
      title: 'Cổ đông',
      key: 'shareholder',
      render: (record: any) => (
        <div>
          <div className="font-medium">{record.shareholder?.fullName}</div>
          <div className="text-xs text-gray-500">{record.shareholder?.shareholderCode}</div>
        </div>
      ),
    },
    {
      title: 'Số cổ phần',
      key: 'shares',
      render: (record: any) => (
        <div>
          <div className="font-medium">{record.sharesRegistered.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {record.shareholder?.totalShares?.toLocaleString()} tổng
          </div>
        </div>
      ),
      align: 'right' as const,
    },
    {
      title: 'Hình thức',
      dataIndex: 'registrationType',
      key: 'registrationType',
      render: (type: string) => (
        <Tag color={getRegistrationTypeColor(type)}>
          {getRegistrationTypeText(type)}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'registrationStatus',
      key: 'registrationStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'In phiếu',
      key: 'print',
      width: 100,
      fixed: 'right' as const,
      render: (record: any) => {
        const printItems: MenuProps['items'] = [
          {
            key: 'attendance',
            label: 'Phiếu tham dự',
            icon: <UserOutlined />,
            disabled: isPrinting,
            onClick: async () => {
              if (!meeting) return
              
              await printAttendanceCard({
                meetingId: meeting.id,
                registrationId: record.registrationId,
                shareholderCode: record.shareholder?.shareholderCode || '',
                shareholderName: record.shareholder?.fullName || '',
                registrationCode: record.registrationCode || '',
                registrationDate: record.registrationDate || new Date().toISOString(),
                registrationType: record.registrationType || 'IN_PERSON'
              })
            }
          },
          {
            key: 'voting',
            label: 'Phiếu biểu quyết',
            icon: <FileTextOutlined />,
            disabled: isPrinting,
            onClick: async () => {
              if (!meeting) return
              
              await printVotingBallot({
                meetingId: meeting.id,
                registrationId: record.registrationId,
                shareholderCode: record.shareholder?.shareholderCode || '',
                shareholderName: record.shareholder?.fullName || '',
                sharesRegistered: record.sharesRegistered || 0
              })
            }
          },
          {
            key: 'election',
            label: 'Phiếu bầu cử',
            icon: <AuditOutlined />,
            disabled: isPrinting,
            onClick: async () => {
              if (!meeting) return
              
              await printElectionBallot({
                meetingId: meeting.id,
                registrationId: record.registrationId,
                shareholderCode: record.shareholder?.shareholderCode || '',
                shareholderName: record.shareholder?.fullName || '',
                sharesRegistered: record.sharesRegistered || 0
              })
            }
          }
        ]

        const menuProps: MenuProps = {
          items: printItems,
        
        }

        return (
          <Dropdown menu={menuProps} placement="bottomRight"  trigger={['click']} >
            <Button
              type="text"
              size="small"
              icon={<PrinterOutlined />}
              loading={isPrinting}
              style={{ color: '#1890ff' }}
            />
          </Dropdown>
        )
      },
    },
  ]

  const expandedRowRender = (record: any) => {
    const shareholder = record.shareholder
    if (!shareholder) return null

    return (
      <div className="p-4 bg-gray-50">
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="CMND/CCCD" span={2}>
            {shareholder.idNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {shareholder.email}
          </Descriptions.Item>
          <Descriptions.Item label="Điện thoại">
            {shareholder.phoneNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh" span={2}>
            {shareholder.dateOfBirth ? new Date(shareholder.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {shareholder.gender === 'MALE' ? 'Nam' : shareholder.gender === 'FEMALE' ? 'Nữ' : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Quốc tịch">
            {shareholder.nationality || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {shareholder.address || '-'}
          </Descriptions.Item>
          {record.proxyName && (
            <>
              <Descriptions.Item label="Người ủy quyền" span={2}>
                {record.proxyName} ({record.proxyIdNumber})
              </Descriptions.Item>
              <Descriptions.Item label="Quan hệ" span={2}>
                {record.proxyRelationship || '-'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </div>
    )
  }

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{meeting?.meetingName}</h2>
            <div className="text-gray-600">
              <Tag color="blue">{meeting?.meetingCode}</Tag>
              <span className="ml-2">
                {meeting?.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="green" className="text-sm">
              {data?.total || 0} cổ đông
            </Tag>
            {isPrinting && (
              <Tag color="processing" icon={<PrinterOutlined spin />}>
                Đang in...
              </Tag>
            )}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      bodyStyle={{ padding: '24px' }}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
          {error.message}
        </div>
      )}

      <div className="space-y-6">
      
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small" hoverable>
              <Statistic
                title="Tổng đăng ký"
                value={data?.statistics?.totalRegistrations || 0}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" hoverable>
              <Statistic
                title="Cổ phần đăng ký"
                value={data?.statistics?.totalSharesRegistered || 0}
                loading={isLoading}
                suffix={`/ ${meeting?.totalShares || 0}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" hoverable>
              <Statistic
                title="Tỷ lệ cổ phần"
                value={data?.statistics?.percentageOfTotalShares || 0}
                precision={1}
                suffix="%"
                loading={isLoading}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" hoverable>
              <Statistic
                title="Đã check-in"
                value={data?.statistics?.checkedInCount || 0}
                loading={isLoading}
                suffix={`/ ${data?.statistics?.totalRegistrations || 0}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Distribution Statistics */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card 
              size="small" 
              title="Phân bổ theo hình thức" 
              className="h-full"
            >
              <div className="space-y-2">
                {data?.statistics?.byRegistrationType && Object.entries(data.statistics.byRegistrationType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getRegistrationTypeColor(type) }}
                      />
                      <span>{getRegistrationTypeText(type)}</span>
                    </div>
                    <div className="font-medium">
                      {count} ({((count / (data?.statistics?.totalRegistrations || 1)) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              size="small" 
              title="Phân bổ theo trạng thái" 
              className="h-full"
            >
              <div className="space-y-2">
                {data?.statistics?.byStatus && Object.entries(data.statistics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Tag 
                        color={getStatusColor(status)} 
                        className="mr-2"
                        style={{ margin: 0 }}
                      >
                        {getStatusText(status)}
                      </Tag>
                    </div>
                    <div className="font-medium">
                      {count} ({((count / (data?.statistics?.totalRegistrations || 1)) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Meeting Information */}
        <Card size="small" title="Thông tin cuộc họp">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Mã cuộc họp</div>
                <div className="font-medium">{data?.meeting?.meetingCode}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Tổng cổ phần</div>
                <div className="font-medium">{data?.meeting?.totalShares?.toLocaleString()}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Tổng cổ đông</div>
                <div className="font-medium">{data?.meeting?.totalShareholders?.toLocaleString()}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-medium">{data?.meeting?.meetingLocation || 'Chưa cập nhật'}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Địa chỉ</div>
                <div className="font-medium">{data?.meeting?.meetingAddress || 'Chưa cập nhật'}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <div className="text-sm text-gray-500">Trạng thái</div>
                <Tag color={
                  data?.meeting?.status === 'COMPLETED' ? 'green' :
                  data?.meeting?.status === 'ONGOING' ? 'orange' :
                  data?.meeting?.status === 'SCHEDULED' ? 'blue' : 'default'
                }>
                  {data?.meeting?.status === 'COMPLETED' ? 'Đã hoàn thành' :
                   data?.meeting?.status === 'ONGOING' ? 'Đang diễn ra' :
                   data?.meeting?.status === 'SCHEDULED' ? 'Đã lên lịch' : 'Nháp'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Shareholders Table */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span>Danh sách cổ đông đã đăng ký</span>
              <div className="text-sm text-gray-500">
                Hiển thị {data?.shareholders?.length || 0} trên tổng số {data?.total || 0}
              </div>
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={columns}
            dataSource={data?.shareholders || []}
            loading={isLoading}
            rowKey="registrationId"
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => !!record.shareholder,
            }}
            pagination={{
              total: data?.total || 0,
              pageSize: data?.pagination?.limit || 10,
              current: data?.pagination?.page || 1,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} cổ đông`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>

        {/* Summary Footer */}
        <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <div>
            <span className="font-medium">Tổng số cổ phần đăng ký: </span>
            <span className="text-blue-600 font-bold">
              {(data?.statistics?.totalSharesRegistered || 0).toLocaleString()}
            </span>
            <span className="mx-2">/</span>
            <span>{(meeting?.totalShares || 0).toLocaleString()}</span>
          </div>

          <div>
            <span className="font-medium">Cập nhật: </span>
            <span>{new Date().toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
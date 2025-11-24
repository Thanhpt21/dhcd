'use client'

import { Modal, List, Tag, Button, message, Select, Space, Divider, Input } from 'antd'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useAllRoles } from '@/hooks/role/useAllRoles'
import type { User } from '@/types/user.type'
import { useUserRoles } from '@/hooks/user-role/useUserRoles'
import { useAddRole } from '@/hooks/user-role/useAddRole'
import { useRemoveRole } from '@/hooks/user-role/useRemoveRole'

const { Option } = Select

interface UserRoleModalProps {
  open: boolean
  onClose: () => void
  user: User | null
  refetch?: () => void
}

export const UserRoleModal = ({ open, onClose, user, refetch }: UserRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [roleSearch, setRoleSearch] = useState('') // Search cho danh sách roles
  
  // Fetch tất cả roles từ API
  const { data: allRoles, isLoading: isLoadingAllRoles } = useAllRoles(roleSearch)
  
  // Fetch roles của user
  const { data: userRoles, isLoading: isLoadingUserRoles, refetch: refetchRoles } = useUserRoles(user?.id || 0)
  
  // Hooks cho thêm/xóa role
  const { mutateAsync: addRole, isPending: isAdding } = useAddRole()
  const { mutateAsync: removeRole, isPending: isRemoving } = useRemoveRole()

  // Reset selected role khi modal đóng/mở
  useEffect(() => {
    if (!open) {
      setSelectedRole(null)
      setRoleSearch('')
    }
  }, [open])

  const handleAddRole = async () => {
    if (!selectedRole || !user) {
      message.warning('Vui lòng chọn role')
      return
    }

    try {
      await addRole({ userId: user.id, roleId: selectedRole })
      message.success('Thêm role thành công')
      setSelectedRole(null)
      refetchRoles() // Refresh danh sách roles
      refetch?.() // Refresh danh sách users nếu cần
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thêm role thất bại')
    }
  }

  const handleRemoveRole = async (roleId: number) => {
    if (!user) return

    Modal.confirm({
      title: 'Xác nhận xóa role',
      content: `Bạn có chắc chắn muốn xóa role này khỏi user ${user.name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await removeRole({ userId: user.id, roleId })
          message.success('Xóa role thành công')
          refetchRoles() // Refresh danh sách roles
          refetch?.() // Refresh danh sách users nếu cần
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Xóa role thất bại')
        }
      },
    })
  }

  // Lọc ra các roles chưa được gán cho user
  const assignedRoleIds = userRoles?.map((ur: any) => ur.roleId) || []
  const unassignedRoles = (allRoles || []).filter((role: any) => !assignedRoleIds.includes(role.id))

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'Admin': 'red',
      'Super Admin': 'purple',
      'Moderator': 'orange',
      'Editor': 'blue',
      'Author': 'green',
      'User': 'default',
      'Guest': 'gray'
    }
    return colors[roleName] || 'cyan'
  }

  const formatPermissionCount = (permissions: any[]) => {
    if (!permissions || !Array.isArray(permissions)) return '0 quyền'
    return `${permissions.length} quyền`
  }

  return (
    <Modal
      title={
        <div>
          <span>Quản lý Role cho </span>
          <span className="font-semibold text-blue-600">{user?.name}</span>
          <div className="text-sm text-gray-500 mt-1">{user?.email}</div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Phần thêm role mới */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-end gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Tìm kiếm role</label>
              <Input
                placeholder="Nhập tên role để tìm kiếm..."
                prefix={<SearchOutlined />}
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                allowClear
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Thêm role mới</label>
              <Select
                placeholder={isLoadingAllRoles ? "Đang tải roles..." : "Chọn role để thêm"}
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%' }}
                disabled={isAdding || unassignedRoles.length === 0}
                optionLabelProp="label"
                loading={isLoadingAllRoles}
                showSearch
                filterOption={false} // Sử dụng search từ server
              >
                {unassignedRoles.map((role: any) => (
                  <Option key={role.id} value={role.id} label={role.name}>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-gray-500">
                          {role.description || 'Không có mô tả'}
                        </div>
                      </div>
                      <Tag color="blue">
                        {formatPermissionCount(role.permissions)}
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>
              
              {unassignedRoles.length === 0 && !isLoadingAllRoles && (
                <div className="text-xs text-gray-500 mt-1">
                  User đã có tất cả các role có sẵn
                </div>
              )}
              
              {isLoadingAllRoles && (
                <div className="text-xs text-gray-500 mt-1">
                  Đang tải danh sách roles...
                </div>
              )}
            </div>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddRole}
              loading={isAdding}
              disabled={!selectedRole || unassignedRoles.length === 0}
            >
              Thêm
            </Button>
          </div>
        </div>

        <Divider />

        {/* Danh sách roles hiện tại */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium m-0">
              Roles hiện tại ({userRoles?.length || 0})
            </h4>
            <Button 
              size="small" 
              onClick={() => refetchRoles()}
              loading={isLoadingUserRoles}
            >
              Làm mới
            </Button>
          </div>
          
          <List
            loading={isLoadingUserRoles}
            dataSource={userRoles || []}
            locale={{ emptyText: 'User chưa có role nào' }}
            renderItem={(userRole: any) => {
              const role = allRoles?.find((r: any) => r.id === userRole.roleId)
              if (!role) {
                return (
                  <List.Item className="hover:bg-gray-50 rounded px-2">
                    <List.Item.Meta
                      avatar={<Tag color="default">ID: {userRole.roleId}</Tag>}
                      description="Role không tồn tại hoặc đã bị xóa"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveRole(userRole.roleId)}
                      loading={isRemoving}
                      size="small"
                    >
                      Xóa
                    </Button>
                  </List.Item>
                )
              }

              return (
                <List.Item
                  className="hover:bg-gray-50 rounded px-2"
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveRole(userRole.roleId)}
                      loading={isRemoving}
                      size="small"
                    >
                      Xóa
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Tag color={getRoleColor(role.name)} className="text-sm px-2 py-1 min-w-[80px] text-center">
                        {role.name}
                      </Tag>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          {role.description || 'Không có mô tả'}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatPermissionCount(role.permissions)}</span>
                          <span>•</span>
                          <span>
                            Thêm vào: {new Date(userRole.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )
            }}
          />
        </div>

        {/* Thông tin tổng quan */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> User có thể có nhiều role. Quyền hạn thực tế sẽ là tổng hợp của tất cả các role được gán.
          </div>
        </div>
      </div>
    </Modal>
  )
}
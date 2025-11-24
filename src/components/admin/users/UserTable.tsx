'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/user/useUsers'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState } from 'react'
import { UserCreateModal } from './UserCreateModal'
import { UserUpdateModal } from './UserUpdateModal'
import { UserRoleModal } from './UserRoleModal'
import type { User } from '@/types/user.type'
import { useAllRoles } from '@/hooks/role/useAllRoles'

const { Option } = Select

export default function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('') 
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openRole, setOpenRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data, isLoading, refetch } = useUsers({ page, limit: 10, search })
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { data: allRoles } = useAllRoles()

  // Lọc user không phải admin và theo role filter
  const nonAdminUsers = (data?.data || []).filter((user: User) => {
    const isNotAdmin = user.role !== 'admin'
    
    // Nếu có filter role, kiểm tra user có role đó không
    if (roleFilter) {
      const hasRole = user.roles?.some((userRole: any) => 
        userRole.role?.name === roleFilter || userRole.role?.id.toString() === roleFilter
      )
      return isNotAdmin && hasRole
    }
    
    return isNotAdmin
  })

  const columns: ColumnsType<User> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: any[]) => {
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
          return <Tag color="default">Chưa có role</Tag>
        }
        
        return (
          <Space size={[0, 4]} wrap>
            {roles.slice(0, 3).map((userRole: any) => (
              <Tag 
                key={userRole.roleId} 
                color={getRoleColor(userRole.role?.name)}
                className="text-xs"
              >
                {userRole.role?.name || `Role ${userRole.roleId}`}
              </Tag>
            ))}
            {roles.length > 3 && (
              <Tag color="blue">+{roles.length - 3}</Tag>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Kích hoạt' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* Nút gán role */}
          <Tooltip title="Gán role">
            <UserAddOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenRole(true)
              }}
            />
          </Tooltip>
          
          {/* Nút chỉnh sửa */}
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          
          {/* Nút xóa */}
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá người dùng',
                  content: `Bạn có chắc chắn muốn xoá người dùng "${record.name}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteUser(record.id)
                      message.success('Xoá người dùng thành công')
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // Hàm lấy màu cho role
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

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const handleResetFilters = () => {
    setInputValue('')
    setSearch('')
    setRoleFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[250px]"
          />
          
          <Select
            placeholder="Lọc theo role"
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
             showSearch
            optionFilterProp="children"
            style={{ width: 150 }}
          >
            {allRoles?.map((role: any) => (
              <Option key={role.id} value={role.name}>
                {role.name}
              </Option>
            ))}
          </Select>

          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          
          <Button onClick={handleResetFilters}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={nonAdminUsers}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: nonAdminUsers.length,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} người dùng`,
        }}
        scroll={{ x: 800 }}
      />

      {/* Modal tạo user */}
      <UserCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch} 
      />

      {/* Modal cập nhật user */}
      <UserUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        user={selectedUser}
        refetch={refetch}
      />

      {/* Modal gán role */}
      <UserRoleModal
        open={openRole}
        onClose={() => setOpenRole(false)}
        user={selectedUser}
        refetch={refetch}
      />
    </div>
  )
}
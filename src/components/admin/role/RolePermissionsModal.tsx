// RolePermissionsModal.tsx
'use client'

import { Modal, Checkbox, Spin, message, Empty, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useAllPermissions } from '@/hooks/permission/useAllPermissions'
import { useRolePermissions } from '@/hooks/role-permission/useRolePermissions'
import { useAddRolePermission } from '@/hooks/role-permission/useAddRolePermission'
import { useRemoveRolePermission } from '@/hooks/role-permission/useRemoveRolePermission'
import type { Permission } from '@/types/permission.type'

interface RolePermissionsModalProps {
  open: boolean
  onClose: () => void
  roleId: number
  roleName: string
}

export function RolePermissionsModal({
  open,
  onClose,
  roleId,
  roleName,
}: RolePermissionsModalProps) {
  const [searchText, setSearchText] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [selectAllLoading, setSelectAllLoading] = useState(false) // ← THÊM TRẠNG THÁI NÀY

  const { data: allPermissions, isLoading: loadingAll } = useAllPermissions()
  const { data: rolePermissions, isLoading: loadingRole, refetch } = useRolePermissions(roleId)
  const { mutateAsync: addPermission } = useAddRolePermission()
  const { mutateAsync: removePermission } = useRemoveRolePermission()

  const selectedIds = rolePermissions?.map((p: Permission) => p.id) || []

  const filteredPermissions = allPermissions?.filter((permission: Permission) => {
    const search = searchText.toLowerCase()
    return (
      permission.name.toLowerCase().includes(search) ||
      permission.description?.toLowerCase().includes(search)
    )
  }) || []

  useEffect(() => {
    if (filteredPermissions.length === 0) {
      setSelectAll(false)
    } else {
      const allSelected = filteredPermissions.every((p: Permission) => selectedIds.includes(p.id))
      setSelectAll(allSelected)
    }
  }, [filteredPermissions, selectedIds])

  const handleChange = async (permissionId: number, checked: boolean) => {
    try {
      if (checked) {
        await addPermission({ roleId, permissionId })
      } else {
        await removePermission({ roleId, permissionId })
      }
      refetch()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  // ← SỬA HÀM NÀY: thêm loading
  const handleSelectAll = async (checked: boolean) => {
    if (selectAllLoading) return // Tránh click liên tục

    setSelectAllLoading(true)
    try {
      if (checked) {
        const toAdd = filteredPermissions.filter((p: Permission) => !selectedIds.includes(p.id))
        for (const p of toAdd) {
          await addPermission({ roleId, permissionId: p.id })
        }
      } else {
        const toRemove = filteredPermissions.filter((p: Permission) => selectedIds.includes(p.id))
        for (const p of toRemove) {
          await removePermission({ roleId, permissionId: p.id })
        }
      }
      await refetch() // Đảm bảo refetch xong mới tắt loading
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSelectAllLoading(false) // ← TẮT LOADING SAU KHI XONG
    }
  }

  return (
    <Modal
      title={`Quản lý quyền cho vai trò: ${roleName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {(loadingAll || loadingRole) ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : !allPermissions || allPermissions.length === 0 ? (
        <Empty description="Chưa có quyền nào" />
      ) : (
        <div>
          {/* Thanh tìm kiếm + Chọn tất cả */}
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Tìm kiếm quyền theo tên hoặc mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="flex-1 mr-4"
            />

            {/* HIỂN THỊ LOADING KHI ĐANG XỬ LÝ "CHỌN TẤT CẢ" */}
            {!selectAll &&
            <Checkbox
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              disabled={selectAllLoading || filteredPermissions.length === 0}
            >
              {selectAllLoading ? (
                <span className="flex items-center gap-2">
                  <Spin size="small" />
                  Đang xử lý thêm hàng loạt (vui lòng chờ)
                </span>
              ) : (
                'Chọn tất cả'
              )}
            </Checkbox>
            }
            
          </div>

          {/* Danh sách permissions */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredPermissions.length === 0 ? (
              <Empty description="Không tìm thấy quyền nào" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredPermissions.map((permission: Permission) => (
                  <div
                    key={permission.id}
                    className="p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                  >
                    <Checkbox
                      checked={selectedIds.includes(permission.id)}
                      onChange={(e) => handleChange(permission.id, e.target.checked)}
                      disabled={selectAllLoading} // Vô hiệu hóa khi đang chọn tất cả
                    >
                      <div>
                        <div className="font-medium text-sm">{permission.name}</div>
                        {permission.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{permission.description}</div>
                        )}
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
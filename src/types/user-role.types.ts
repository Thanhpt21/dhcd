export interface UserRole {
  id: number
  userId: number
  roleId: number
  createdAt: string
  updatedAt: string
}

export interface CreateUserRoleRequest {
  userId: number
  roleId: number
}

export interface UserRoleResponse {
  success: boolean
  message: string
  data?: UserRole
}

export interface UserRolesResponse {
  success: boolean
  message: string
  data: UserRole[]
}

export interface RemoveUserRoleResponse {
  success: boolean
  message: string
  data?: null
}
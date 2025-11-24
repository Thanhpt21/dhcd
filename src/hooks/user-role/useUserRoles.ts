import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUserRoles = (userId: number | string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const res = await api.get(`/user-roles/${userId}`)
      return res.data.data // Lấy data từ { success, message, data }
    },
    enabled: !!userId,
  })
}
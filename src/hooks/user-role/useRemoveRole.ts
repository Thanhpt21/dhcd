import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRemoveRole = () => {
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const res = await api.delete(`/user-roles/${userId}/${roleId}`)
      return res.data 
    },
  })
}
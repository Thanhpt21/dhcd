import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAddRole = () => {
  return useMutation({
    mutationFn: async (data: { userId: number; roleId: number }) => {
      const res = await api.post('/user-roles', data)
      return res.data
    },
  })
}
// src/hooks/meeting/useMeetingOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingOne = (id: number | string) => {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const res = await api.get(`/meetings/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}
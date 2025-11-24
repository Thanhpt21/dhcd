// src/hooks/attendance/useAutoCheckoutStatus.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAutoCheckoutStatus = (meetingId: number) => {
  return useQuery({
    queryKey: ['auto-checkout-status', meetingId],
    queryFn: async () => {
      const res = await api.get(`/auto-checkout/status/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
    refetchInterval: 30000, // Refetch mỗi 30 giây
  })
}


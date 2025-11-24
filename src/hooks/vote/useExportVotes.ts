// src/hooks/vote/useExportVotes.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useExportVotes = () => {
  return useMutation({
    mutationFn: async (resolutionId: number) => {
      const res = await api.get(`/votes/export/resolution/${resolutionId}`, {
        responseType: 'blob'
      })
      return res.data
    },
  })
}
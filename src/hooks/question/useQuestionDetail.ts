// src/hooks/question/useQuestionDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useQuestionDetail = (id: number) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      const res = await api.get(`/questions/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

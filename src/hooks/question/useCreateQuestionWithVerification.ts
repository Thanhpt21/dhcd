// src/hooks/question/useCreateQuestionWithVerification.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateQuestionRequest } from '@/types/question.type'

export const useCreateQuestionWithVerification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const res = await api.post('/questions', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['top-upvoted-questions'] })
      queryClient.invalidateQueries({ queryKey: ['meeting-questions'] })
    },
  })
}
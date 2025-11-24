// src/hooks/question/useAnswerQuestion.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAnswerQuestion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, answerText, answeredBy }: { id: number; answerText: string; answeredBy: string }) => {
      const res = await api.put(`/questions/${id}/answer`, { answerText, answeredBy })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['question', variables.id] })
    },
  })
}
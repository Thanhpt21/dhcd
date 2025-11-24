// src/hooks/question/useUpvoteQuestion.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpvoteQuestion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ questionId, shareholderId }: { questionId: number; shareholderId: number }) => {
      const res = await api.post(`/questions/${questionId}/upvote`, { shareholderId })
      return res.data
    },
    onSuccess: (_, variables) => {
      // Invalidate tất cả các queries liên quan đến questions
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['question', variables.questionId] })
      queryClient.invalidateQueries({ queryKey: ['meeting-questions'] })
      queryClient.invalidateQueries({ queryKey: ['top-upvoted-questions'] }) // QUAN TRỌNG
      queryClient.invalidateQueries({ queryKey: ['meetingQuestions'] })
    },
  })
}
// src/hooks/document/useUpdateDocument.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateDocumentRequest } from '@/types/document.type'

export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number | string; formData: FormData }) => {
      const res = await api.put(`/documents/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['meetingDocuments'] })
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
    },
  })
}
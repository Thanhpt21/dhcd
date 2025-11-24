// src/hooks/upload/useDeleteImage.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await api.delete('/upload/image', {
        data: { url: imageUrl } // Gửi URL cần xóa trong body
      })
      return res.data
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Xóa ảnh thất bại')
    },
  })
}
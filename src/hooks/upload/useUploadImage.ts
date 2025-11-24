// src/hooks/useUploadImage.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file) 
      
      const res = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data.data.url 
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Upload ảnh thất bại')
    },
  })
}
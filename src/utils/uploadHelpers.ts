import { message } from 'antd'
import { Upload } from 'antd'
import type { RcFile } from 'antd/es/upload/interface'

/**
 * Validate file ảnh trước khi upload
 * @param file - File cần validate
 * @param maxSizeMB - Kích thước tối đa (MB), mặc định 5MB
 * @returns false để không upload tự động, Upload.LIST_IGNORE để bỏ qua file
 */
export const beforeUploadImage = (file: RcFile, maxSizeMB: number = 5) => {
  // Kiểm tra file có phải là ảnh không
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('Chỉ được upload file ảnh!')
    return Upload.LIST_IGNORE
  }

  // Kiểm tra kích thước file
  const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB
  if (!isLtMaxSize) {
    message.error(`Ảnh phải nhỏ hơn ${maxSizeMB}MB!`)
    return Upload.LIST_IGNORE
  }

  // Trả về false để không upload tự động (xử lý khi submit form)
  return false
}

/**
 * Validate file ảnh với các loại file được chấp nhận cụ thể
 * @param file - File cần validate
 * @param allowedTypes - Mảng các MIME type được phép
 * @param maxSizeMB - Kích thước tối đa (MB)
 * @returns false hoặc Upload.LIST_IGNORE
 */
export const beforeUploadImageStrict = (
  file: RcFile,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxSizeMB: number = 5
) => {
  const isAllowedType = allowedTypes.includes(file.type)
  if (!isAllowedType) {
    message.error(`Chỉ chấp nhận file: ${allowedTypes.join(', ')}`)
    return Upload.LIST_IGNORE
  }

  const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB
  if (!isLtMaxSize) {
    message.error(`File phải nhỏ hơn ${maxSizeMB}MB!`)
    return Upload.LIST_IGNORE
  }

  return false
}

/**
 * Format file size từ bytes sang đơn vị dễ đọc
 * @param bytes - Kích thước file (bytes)
 * @returns String formatted (VD: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
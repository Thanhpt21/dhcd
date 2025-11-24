// hooks/report/useExportWithProgress.ts
import { useState } from 'react'
import { api } from '@/lib/axios'
import { message } from 'antd'

interface DownloadProgress {
  loaded: number
  total: number
  percent: number
}

interface ExportResult {
  success: boolean
  error?: any
}

interface ExportOptions {
  type: string
  filters?: Record<string, any>
  customFileName?: string
  endpoint?: string
}

export const useExportWithProgress = () => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const exportData = async (options: ExportOptions): Promise<ExportResult> => {
    const { type, filters = {}, customFileName, endpoint = '/reports/export' } = options
    
    setIsExporting(true)
    setProgress({ loaded: 0, total: 0, percent: 0 })

    try {
      console.log(`🔄 Starting export for ${type}...`, { filters })

      // Build query parameters
      const params = new URLSearchParams()
      params.append('type', type)
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`${endpoint}/${type}?${params.toString()}`, {
        responseType: 'blob',
        timeout: 30000,
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent
          const percent = total ? Math.round((loaded * 100) / total) : 0
          
          setProgress({
            loaded,
            total: total || 0,
            percent
          })

          console.log(`📥 Export progress: ${percent}% (${loaded}/${total})`)
        }
      })

      console.log('📨 Response received:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data.size,
        contentType: response.headers['content-type']
      })

      // Kiểm tra nếu response là blob hợp lệ
      if (!(response.data instanceof Blob)) {
        console.error('❌ Invalid response data:', response.data)
        throw new Error('Dữ liệu response không hợp lệ')
      }

      if (response.data.size === 0) {
        throw new Error('File rỗng')
      }

      // Kiểm tra content type
      const contentType = response.headers['content-type']
      const expectedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
        'application/vnd.ms-excel'
      ]

      if (!expectedTypes.some(expectedType => contentType?.includes(expectedType))) {
        console.warn('⚠️ Unexpected content type:', contentType)
      }

      // Tạo và trigger download
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      
      // Lấy filename từ header, custom filename hoặc sử dụng default
      const contentDisposition = response.headers['content-disposition']
      let finalFileName = customFileName

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (fileNameMatch && fileNameMatch[1]) {
          finalFileName = decodeURIComponent(fileNameMatch[1])
          console.log(`📝 Filename from header: ${finalFileName}`)
        }
      }

      // Đảm bảo file có extension .xlsx
      if (!finalFileName) {
        finalFileName = `${type.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      } else if (!finalFileName.toLowerCase().endsWith('.xlsx')) {
        finalFileName = `${finalFileName.split('.')[0]}.xlsx`
      }

      link.setAttribute('download', finalFileName)
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      console.log('✅ Export completed successfully', {
        type,
        fileName: finalFileName,
        fileSize: response.data.size,
        fileType: response.data.type
      })

      message.success(`Đã tải xuống ${finalFileName}`)
      return { success: true }

    } catch (error: any) {
      console.error('💥 Export error details:', {
        type,
        filters,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      })

      let errorMessage = 'Export thất bại'
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy dữ liệu'
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn cần đăng nhập để export'
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền export dữ liệu này'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Timeout khi export. Vui lòng thử lại.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.'
      }

      message.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }

  // Các hàm helper cho từng loại export cụ thể
  const exportShareholders = (filters?: any, customFileName?: string) => {
    return exportData({
      type: 'SHAREHOLDERS',
      filters,
      customFileName: customFileName || `danh_sach_co_dong_${new Date().toISOString().split('T')[0]}.xlsx`
    })
  }

  const exportRegistrations = (meetingId?: number, customFileName?: string) => {
    return exportData({
      type: 'REGISTRATIONS',
      filters: meetingId ? { meetingId } : {},
      customFileName: customFileName || (meetingId 
        ? `danh_sach_dang_ky_${meetingId}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `danh_sach_dang_ky_${new Date().toISOString().split('T')[0]}.xlsx`)
    })
  }

  const exportVotingResults = (resolutionId: number, customFileName?: string) => {
    return exportData({
      type: 'VOTING_RESULTS',
      filters: { resolutionId },
      customFileName: customFileName || `ket_qua_bau_phieu_${new Date().toISOString().split('T')[0]}.xlsx`
    })
  }

  const exportAttendances = (meetingId: number, customFileName?: string) => {
    return exportData({
      type: 'ATTENDANCES',
      filters: { meetingId },
      customFileName: customFileName || `danh_sach_diem_danh_${new Date().toISOString().split('T')[0]}.xlsx`
    })
  }

  return {
    // Hàm chung
    exportData,
    
    // Các hàm cụ thể
    exportShareholders,
    exportRegistrations,
    exportVotingResults,
    exportAttendances,
    
    // State
    progress,
    isExporting
  }
}
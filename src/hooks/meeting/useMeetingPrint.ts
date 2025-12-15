// src/hooks/meeting/useMeetingPrint.ts
import { useState } from 'react'
import { api } from '@/lib/axios'
import { message } from 'antd'

interface PrintVotingBallotParams {
  meetingId: number
  registrationId: number
  shareholderCode: string
  shareholderName: string
  sharesRegistered: number
}

interface PrintAttendanceCardParams {
  meetingId: number
  registrationId: number
  shareholderCode: string
  shareholderName: string
  registrationCode: string
  registrationDate: string
  registrationType: string
}

interface PrintElectionBallotParams {
  meetingId: number
  registrationId: number
  shareholderCode: string
  shareholderName: string
  sharesRegistered: number
}

interface PrintResult {
  success: boolean
  message: string
  url?: string
}

export const useMeetingPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false)
  const [printQueue, setPrintQueue] = useState<string[]>([])

  const handlePrintWindow = (pdfBlob: Blob, fileName: string): boolean => {
    try {
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      // Tạo iframe để in thay vì mở cửa sổ mới
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = pdfUrl
      
      document.body.appendChild(iframe)
      
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print()
          
          // Thêm vào queue để quản lý
          setPrintQueue(prev => [...prev, fileName])
          
          // Cleanup sau khi in
          setTimeout(() => {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(pdfUrl)
          }, 1000)
        } catch (error) {
          console.error('Print error:', error)
          message.error('Lỗi khi in tài liệu')
        }
      }
      
      return true
    } catch (error) {
      console.error('Error creating print window:', error)
      return false
    }
  }

  const downloadPdf = (pdfBlob: Blob, fileName: string) => {
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const printVotingBallot = async (params: PrintVotingBallotParams): Promise<PrintResult> => {
    try {
      setIsPrinting(true)
      
      const response = await api.post('/print/voting-ballot', params, {
        responseType: 'blob'
      })
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      const fileName = `phieu-bieu-quyet-${params.shareholderCode}.pdf`
      
      // Cho phép người dùng chọn in hoặc tải về
      if (window.confirm('Bạn muốn in ngay hay tải về?')) {
        const printSuccess = handlePrintWindow(pdfBlob, fileName)
        if (printSuccess) {
          message.success('Đang in phiếu biểu quyết...')
          return { success: true, message: 'Đang in phiếu biểu quyết' }
        }
      } else {
        downloadPdf(pdfBlob, fileName)
        message.success('Đã tải phiếu biểu quyết')
        return { success: true, message: 'Đã tải phiếu biểu quyết', url: fileName }
      }
      
      return { success: false, message: 'Không thể in phiếu biểu quyết' }
      
    } catch (error: any) {
      console.error('Lỗi khi in phiếu biểu quyết:', error)
      const errorMsg = error.response?.data?.message || 'Không thể in phiếu biểu quyết'
      message.error(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setIsPrinting(false)
    }
  }

  const printAttendanceCard = async (params: PrintAttendanceCardParams): Promise<PrintResult> => {
    try {
      setIsPrinting(true)
      
      const response = await api.post('/print/attendance-card', params, {
        responseType: 'blob'
      })
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      const fileName = `phieu-tham-du-${params.shareholderCode}.pdf`
      
      if (window.confirm('Bạn muốn in ngay hay tải về?')) {
        const printSuccess = handlePrintWindow(pdfBlob, fileName)
        if (printSuccess) {
          message.success('Đang in phiếu tham dự...')
          return { success: true, message: 'Đang in phiếu tham dự' }
        }
      } else {
        downloadPdf(pdfBlob, fileName)
        message.success('Đã tải phiếu tham dự')
        return { success: true, message: 'Đã tải phiếu tham dự', url: fileName }
      }
      
      return { success: false, message: 'Không thể in phiếu tham dự' }
      
    } catch (error: any) {
      console.error('Lỗi khi in phiếu tham dự:', error)
      const errorMsg = error.response?.data?.message || 'Không thể in phiếu tham dự'
      message.error(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setIsPrinting(false)
    }
  }

  const printElectionBallot = async (params: PrintElectionBallotParams): Promise<PrintResult> => {
    try {
      setIsPrinting(true)
      
      const response = await api.post('/print/election-ballot', params, {
        responseType: 'blob'
      })
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      const fileName = `phieu-bau-cu-${params.shareholderCode}.pdf`
      
      if (window.confirm('Bạn muốn in ngay hay tải về?')) {
        const printSuccess = handlePrintWindow(pdfBlob, fileName)
        if (printSuccess) {
          message.success('Đang in phiếu bầu cử...')
          return { success: true, message: 'Đang in phiếu bầu cử' }
        }
      } else {
        downloadPdf(pdfBlob, fileName)
        message.success('Đã tải phiếu bầu cử')
        return { success: true, message: 'Đã tải phiếu bầu cử', url: fileName }
      }
      
      return { success: false, message: 'Không thể in phiếu bầu cử' }
      
    } catch (error: any) {
      console.error('Lỗi khi in phiếu bầu cử:', error)
      const errorMsg = error.response?.data?.message || 'Không thể in phiếu bầu cử'
      message.error(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setIsPrinting(false)
    }
  }

  const printBatchAttendanceCards = async (registrationIds: number[]): Promise<PrintResult> => {
    try {
      setIsPrinting(true)
      
      const response = await api.post('/print/batch-attendance-cards', {
        registrationIds
      }, {
        responseType: 'blob'
      })
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      const fileName = `phieu-tham-du-loat-${new Date().getTime()}.pdf`
      
      if (window.confirm(`In ${registrationIds.length} phiếu tham dự?`)) {
        const printSuccess = handlePrintWindow(pdfBlob, fileName)
        if (printSuccess) {
          message.success(`Đang in ${registrationIds.length} phiếu tham dự...`)
          return { success: true, message: `Đang in ${registrationIds.length} phiếu tham dự` }
        }
      } else {
        downloadPdf(pdfBlob, fileName)
        message.success(`Đã tải ${registrationIds.length} phiếu tham dự`)
        return { success: true, message: `Đã tải ${registrationIds.length} phiếu tham dự`, url: fileName }
      }
      
      return { success: false, message: 'Không thể in hàng loạt' }
      
    } catch (error: any) {
      console.error('Lỗi khi in hàng loạt:', error)
      const errorMsg = error.response?.data?.message || 'Không thể in hàng loạt'
      message.error(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setIsPrinting(false)
    }
  }

  // Hàm kiểm tra lịch sử in
  const getPrintHistory = () => {
    return printQueue
  }

  // Hàm xóa lịch sử in
  const clearPrintHistory = () => {
    setPrintQueue([])
    message.success('Đã xóa lịch sử in')
  }

  return {
    printVotingBallot,
    printAttendanceCard,
    printElectionBallot,
    printBatchAttendanceCards,
    getPrintHistory,
    clearPrintHistory,
    isPrinting,
  }
}
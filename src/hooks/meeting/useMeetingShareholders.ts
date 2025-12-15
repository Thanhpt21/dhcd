// src/hooks/meeting/useMeetingShareholders.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface MeetingShareholder {
  registrationId: number
  registrationCode: string
  registrationDate: string | null
  registrationType: string
  registrationStatus: string
  sharesRegistered: number
  checkinTime: string | null
  checkinMethod: string | null
  notes: string | null
  hasCheckedIn: boolean
  proxyName: string | null
  proxyIdNumber: string | null
  proxyRelationship: string | null
  proxyDocumentUrl: string | null
  shareholder: {
    id: number
    shareholderCode: string
    fullName: string
    idNumber: string
    email: string
    phoneNumber: string | null
    address: string | null
    totalShares: number
    shareType: string
    isActive: boolean
    dateOfBirth: string | null
    gender: string | null
    nationality: string | null
    bankAccount: string | null
    bankName: string | null
    taxCode: string | null
    idIssueDate: string | null
    idIssuePlace: string | null
  } | null
}

interface MeetingInfo {
  id: number
  meetingCode: string
  meetingName: string
  meetingDate: string | null
  meetingLocation: string | null
  meetingAddress: string | null
  status: string
  totalShares: number
  totalShareholders: number
}

interface Statistics {
  totalRegistrations: number
  totalSharesRegistered: number
  percentageOfTotalShares: number
  checkedInCount: number
  checkinRate: number
  byRegistrationType: Record<string, number>
  byStatus: Record<string, number>
}

interface MeetingShareholdersResponse {
  success: boolean
  message: string
  data: {
    meeting: MeetingInfo
    shareholders: MeetingShareholder[]
    statistics: Statistics
    total: number
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export const useMeetingShareholders = (
  meetingId: number | undefined,
  search?: string,
  status?: string,
  registrationType?: string,
  options?: {
    enabled?: boolean
  }
) => {
  return useQuery<MeetingShareholdersResponse['data']>({
    queryKey: ['meetingShareholders', meetingId, search, status, registrationType],
    queryFn: async () => {
      if (!meetingId) throw new Error('Meeting ID is required')

      const res = await api.get<MeetingShareholdersResponse>(`/meetings/${meetingId}/shareholder/all`, {
        params: { 
          search: search || undefined,
          status: status || undefined,
          registrationType: registrationType || undefined
        },
      })
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch shareholders')
      }
      
      return res.data.data
    },
    enabled: options?.enabled !== false && !!meetingId,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  })
}
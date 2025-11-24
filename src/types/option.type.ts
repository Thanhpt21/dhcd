// src/types/option.type.ts
export interface ResolutionOption {
  id: number
  resolutionId: number
  optionCode: string
  optionText: string
  optionValue: string
  description?: string
  displayOrder: number
  voteCount: number
  createdAt: string
}

export interface CreateOptionRequest {
  resolutionId: number
  optionCode: string
  optionText: string
  optionValue: string
  description?: string
  displayOrder?: number
}

export interface UpdateOptionRequest {
  optionCode?: string
  optionText?: string
  optionValue?: string
  description?: string
  displayOrder?: number
}

export interface OptionStatistics {
  totalOptions: number
  totalVotes: number
  averageVotesPerOption: number
  topOption: ResolutionOption | null
}

export interface OptionsResponse {
  data: ResolutionOption[]
  total: number
  page: number
  pageCount: number
}
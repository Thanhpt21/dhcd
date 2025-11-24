// src/types/agenda.type.ts
export enum AgendaStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED'
}

export interface Agenda {
  id: number;
  meetingId: number;
  agendaCode: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  speaker?: string;
  presentationUrl?: string;
  displayOrder: number;
  status: AgendaStatus;
  createdAt: string;
  updatedAt: string;
  
  // Optional relations
  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
    meetingDate?: string;
  };
}

export interface AgendaWithProgress extends Agenda {
  progress: number;
}

export interface CreateAgendaRequest {
  meetingId: number;
  agendaCode: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  speaker?: string;
  presentationUrl?: string;
  displayOrder?: number;
  status?: AgendaStatus;
}

export interface UpdateAgendaRequest extends Partial<CreateAgendaRequest> {
  id: number;
}

export interface AgendaTimeline {
  totalItems: number;
  totalDuration: number;
  completedDuration: number;
  completionRate: number;
  items: Array<Agenda & { progress: number }>;
}

export interface AgendaStatistics {
  totalAgendas: number;
  pendingAgendas: number;
  ongoingAgendas: number;
  completedAgendas: number;
  cancelledAgendas: number;
  totalDuration: number;
  completedDuration: number;
  completionRate: number;
  hasPresentation: number;
  byStatus: Record<string, number>;
}
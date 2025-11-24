export enum PromptAIStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export interface PromptAI {
  id: number;
  name: string;
  text: string;
  status: PromptAIStatus;
  position: number;
  startDate: string;  
  endDate: string;   
  createdAt: string; 
  updatedAt: string; 
}

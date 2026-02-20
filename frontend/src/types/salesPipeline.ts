export type DealStage = 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface Deal {
  id: string;
  title: string;
  customerName: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  probability: number; // 0-100
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: DealStage;
  label: string;
  color: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'PROSPECT', label: 'Prospect', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'PROPOSAL', label: 'Proposal', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-100 text-red-700 border-red-200' },
];

export type PainPointStatus = '待验证' | '客户陈述' | '证据支持' | '试点验证' | '已否定';

export interface PainPointItem {
  id: string;
  name: string;
  roles?: string;
  status: PainPointStatus;
  description?: string;
  evidenceSource?: string;
}

export interface InterviewFeedback {
  id: string;
  date: string;
  targetRole: string;
  discussedPainPoints: string;
  clientQuotes: string;
  confirmedFacts: string;
  deniedFacts: string;
  clientData: string;
  openQuestions: string;
  advisorRequests: string;
  createdAt: string;
}

export interface CaseSession {
  id: string;
  title: string;
  industry: string;
  companyName: string;
  website?: string;
  region?: string;
  coreBusiness?: string;
  contactRole?: string;
  backgroundNotes?: string;
  meetingGoal?: string;
  currentStep: 1 | 2 | 3 | 4;
  
  // Research outputs
  researchResult?: string;
  agent1ReviewChecks?: Record<string, boolean>;

  // Combat card outputs
  combatCardResult?: string;
  agent2ReviewChecks?: Record<string, boolean>;

  // Dynamic feedback outputs
  interviewFeedbacks?: InterviewFeedback[];
  dynamicDiagnosisResult?: string;
  painPointsList?: PainPointItem[];

  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  defaultPrompts?: {
    agent1: string;
    agent2: string;
    dynamicDiagnosis: string;
  };
}

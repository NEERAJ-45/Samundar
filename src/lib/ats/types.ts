import type { IResumeScores } from '@/lib/models/ResumeAnalysis';

export interface AtsAnalysis {
  atsScore: number;
  matchScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AtsResult {
  action: 'analyze' | 'optimize';
  scores: IResumeScores;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizedSource?: string | null;
}

export interface AtsRunInput {
  resume: string;
  jobDescription: string;
  roleTitle?: string | null;
  action: 'analyze' | 'optimize';
}

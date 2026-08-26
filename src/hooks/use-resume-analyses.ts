import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/components/providers/ProfileProvider';
import { useCallback } from 'react';

export interface AnalysisScores {
  atsScore: number;
  matchScore: number;
  structure: number;
  keywords: number;
  actionVerbs: number;
  quantifiableImpact: number;
  length: number;
  contactInfo: number;
}

export interface AtsResult {
  action: 'analyze' | 'optimize';
  scores: AnalysisScores;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizedSource?: string | null;
}

export interface ResumeAnalysisRow {
  _id: string;
  userEmail: string;
  resumeId: string | null;
  action: 'analyze' | 'optimize';
  jd: string;
  roleTitle: string | null;
  resumeSnapshot: string;
  scores: AnalysisScores;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizedSource: string | null;
  createdAt: string;
}

interface AnalysesResponse {
  dbConnected: boolean;
  data: ResumeAnalysisRow[];
}

export interface AtsRunParams {
  resume: string;
  jobDescription: string;
  roleTitle?: string | null;
  action: 'analyze' | 'optimize';
  resumeId?: string | null;
}

function useHeaders() {
  const { userEmail, customDbUrl } = useProfile();
  return useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    return headers;
  }, [userEmail, customDbUrl]);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message: string;
    try {
      const body = await res.json();
      message = body.error || `Request failed (${res.status})`;
    } catch {
      message = `Request failed (${res.status})`;
    }
    throw new Error(message);
  }
  return res.json();
}

export function useResumeAnalysesQuery(resumeId?: string | null) {
  const { userEmail } = useProfile();
  const getHeaders = useHeaders();

  return useQuery<AnalysesResponse>({
    queryKey: ['resume-analyses', resumeId ?? 'all'],
    queryFn: async () => {
      const ts = Date.now();
      const q = resumeId ? `?resumeId=${encodeURIComponent(resumeId)}&_=${ts}` : `?_=${ts}`;
      const res = await fetch(`/api/db/resume-analyses${q}`, { headers: getHeaders() });
      return handleResponse<AnalysesResponse>(res);
    },
    enabled: !!userEmail,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useAtsRun() {
  const getHeaders = useHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AtsRunParams): Promise<AtsResult> => {
      const res = await fetch('/api/ats', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      return handleResponse<AtsResult>(res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume-analyses', variables.resumeId ?? 'all'] });
    },
  });
}

export function useDeleteResumeAnalysis() {
  const getHeaders = useHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; resumeId?: string | null }) => {
      const res = await fetch(`/api/db/resume-analyses?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume-analyses', variables.resumeId ?? 'all'] });
    },
  });
}

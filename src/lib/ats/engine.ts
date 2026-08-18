import { GoogleGenAI } from '@google/genai';
import type { IResumeScores } from '@/lib/models/ResumeAnalysis';
import { SCORE_KEYS } from '@/lib/models/ResumeAnalysis';

// ponytail: only GA/current models — older 2.x-era models 404 for new-account keys.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

export interface LlmAnalysis extends IResumeScores {
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizedSource?: string | null;
  contentPreserved?: boolean;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(max, Math.max(min, n));
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) return [v];
  return [];
}

function cleanJson(text: string): { start: number; end: number } {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Could not parse AI response');
  }
  return { start, end };
}

function normalize(raw: Record<string, unknown>): LlmAnalysis {
  const scores = {} as IResumeScores;
  for (const key of SCORE_KEYS) {
    scores[key] = clamp(Number(raw[key]), 0, 100);
  }
  return {
    ...scores,
    missingKeywords: asArray(raw.missingKeywords),
    presentKeywords: asArray(raw.presentKeywords),
    strengths: asArray(raw.strengths),
    weaknesses: asArray(raw.weaknesses),
    recommendations: asArray(raw.recommendations),
    optimizedSource: typeof raw.optimizedSource === 'string' ? raw.optimizedSource : null,
    contentPreserved: raw.contentPreserved === true,
  };
}

export async function generateJson(
  prompt: string,
  optimize: boolean,
): Promise<LlmAnalysis> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured on the server');
  }

  const genai = new GoogleGenAI({ apiKey });
  let lastErr: unknown;

  for (const model of MODELS) {
    try {
      const response = await genai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: optimize ? 8192 : 4096,
        },
      });
      const text = response.text ?? '';
      const { start, end } = cleanJson(text);
      const raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
      return normalize(raw);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr ?? new Error('AI request failed');
}

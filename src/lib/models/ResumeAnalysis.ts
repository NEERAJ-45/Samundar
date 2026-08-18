import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeScores {
  atsScore: number;
  matchScore: number;
  structure: number;
  keywords: number;
  actionVerbs: number;
  quantifiableImpact: number;
  length: number;
  contactInfo: number;
}

export interface IResumeAnalysis extends Document {
  userEmail: string;
  resumeId: mongoose.Types.ObjectId | null;
  action: 'analyze' | 'optimize';
  jd: string;
  roleTitle: string | null;
  resumeSnapshot: string;
  scores: IResumeScores;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizedSource: string | null;
  createdAt: Date;
}

export const SCORE_KEYS = [
  'atsScore',
  'matchScore',
  'structure',
  'keywords',
  'actionVerbs',
  'quantifiableImpact',
  'length',
  'contactInfo',
] as const;

const ResumeAnalysisSchema: Schema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', index: true, default: null },
    action: { type: String, enum: ['analyze', 'optimize'], required: true },
    jd: { type: String, required: true },
    roleTitle: { type: String, default: null },
    resumeSnapshot: { type: String, required: true },
    scores: {
      atsScore: { type: Number, default: 0 },
      matchScore: { type: Number, default: 0 },
      structure: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      actionVerbs: { type: Number, default: 0 },
      quantifiableImpact: { type: Number, default: 0 },
      length: { type: Number, default: 0 },
      contactInfo: { type: Number, default: 0 },
    },
    missingKeywords: { type: [String], default: [] },
    presentKeywords: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    optimizedSource: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { minimize: false },
    toObject: { minimize: false },
  },
);

export default mongoose.models.ResumeAnalysis || mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);

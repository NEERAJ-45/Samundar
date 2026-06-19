export type NodeType = 'PILLAR' | 'DOMAIN' | 'MODULE' | 'SUBMODULE' | 'TOPIC' | 'SUBTOPIC' | 'LEARNING_UNIT';

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type OperatingMode = 'HOME' | 'OFFICE';

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  parentId: string | null;
  order: number;
  estimatedHours?: number;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  priorityScore?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MasteryRecord {
  id: string;
  knowledgeNodeId: string;
  level: MasteryLevel;
  history: { level: MasteryLevel; timestamp: string; note?: string }[];
  lastRevised: string | null;
  interviewReadiness: boolean;
  notesCount: number;
  linkedConcepts: string[];
  mentalModel?: string;
  implementationNotes?: string;
  realWorldExamples?: string[];
  interviewQuestions?: string[];
  productionPitfalls?: string[];
  tradeoffs?: string[];
  projectsUsingIt?: string[];
  bookReferences?: string[];
  documentationRefs?: string[];
  researchPapers?: string[];
  sourceCodeRefs?: string[];
}

export interface RevisionSchedule {
  id: string;
  knowledgeNodeId: string;
  stage: 1 | 7 | 30 | 90 | 180 | 365;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  vision?: string;
  architecture?: string;
  features: string[];
  technologies: string[];
  linkedConceptIds: string[];
  status: 'IDEA' | 'IN_PROGRESS' | 'COMPLETED' | 'MAINTAINING' | 'ARCHIVED';
  lessons?: string[];
  deploymentStrategy?: string;
  productionIncidents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  knowledgeNodeId: string;
  question: string;
  answer?: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  attempts: number;
  mistakes: string[];
  weakAreas: string[];
  type: 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'CORE_CS' | 'LANGUAGE' | 'FRAMEWORK';
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'TO_READ' | 'READING' | 'COMPLETED' | 'REFERENCE';
  notes?: string;
  linkedNodeIds: string[];
  progress: number;
  rating?: number;
  createdAt: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  source: string;
  year: number;
  status: 'TO_READ' | 'READING' | 'COMPLETED';
  notes?: string;
  linkedNodeIds: string[];
  url?: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  date: string;
  hours: number;
  unitsCovered: string[];
  mode: OperatingMode;
  notes?: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'MISSION' | 'VISION' | 'GOAL' | 'PRINCIPLE';
  targetDate?: string;
  completed: boolean;
  order: number;
}

export interface CareerGoal {
  id: string;
  title: string;
  targetCompanies: string[];
  targetLevel: string;
  milestones: { title: string; completed: boolean; date?: string }[];
  fiveYearGoal?: string;
  tenYearGoal?: string;
  engineeringPhilosophy?: string;
  personalQuotes?: string[];
}

export interface SyncEvent {
  eventId: string;
  eventType: 'UPDATE_MASTERY' | 'COMPLETE_REVISION' | 'ADD_NOTE' | 'LOG_SESSION' | 'UPDATE_PROJECT';
  conceptId: string;
  newValue?: unknown;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalLearningHours: number;
  masteryGrowth: { date: string; averageMastery: number }[];
  knowledgeGrowth: { date: string; totalNodes: number }[];
  revisionAccuracy: number;
  projectProgress: number;
  interviewReadiness: number;
  weakAreas: string[];
  strongAreas: string[];
  currentStreak: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

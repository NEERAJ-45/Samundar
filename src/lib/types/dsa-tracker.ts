export type Difficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type Importance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CompanyRelevance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ProblemSource = 'LEETCODE' | 'GEEKSFORGEEKS' | 'EDUCATIVE' | 'CODEFORCES' | 'ATCODER' | 'HACKERRANK' | 'CODECHEF' | 'OTHER';
export type ProblemAction = 'ATTEMPTED' | 'SOLVED' | 'REVISED' | 'RE_SOLVED' | 'BOOKMARKED';

export interface ActivityLogEntry {
  date: string;
  action: ProblemAction;
  timeSpentMinutes: number;
  notes: string;
}

export interface ProblemActivity {
  completed: boolean;
  attemptCount: number;
  solveCount: number;
  firstSolvedDate: string | null;
  lastSolvedDate: string | null;
  revisionCount: number;
  activityLog: ActivityLogEntry[];
}

export interface Problem {
  id: string;
  name: string;
  url: string;
  source: ProblemSource;
  difficulty: Difficulty;
  completed: boolean;
  pattern: string;
  whyItBelongs: string;
  interviewFrequency: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  googleRelevance: CompanyRelevance;
  metaRelevance: CompanyRelevance;
  amazonRelevance: CompanyRelevance;
  deShawRelevance: CompanyRelevance;
  notes: string;
  attempts: number;
  lastSolved: string | null;
  revisionCount: number;
  activity: ProblemActivity;
}

export interface RevisionStage {
  day: number;
  recallAccuracy: number | null;
  confidence: number | null;
  timeToSolveMinutes: number | null;
  mistakes: string[];
  notes: string;
}

export interface PatternRecognitionSignals {
  howToIdentify: string;
  commonKeywords: string[];
  inputClues: string[];
  constraintClues: string[];
  optimizationSignals: string[];
  interviewTriggers: string[];
  whenNotToUse: string;
  commonConfusions: string[];
}

export interface CommonMistakes {
  implementationMistakes: string[];
  patternRecognitionMistakes: string[];
  complexityMistakes: string[];
  edgeCaseMistakes: string[];
  interviewMistakes: string[];
}

export interface CompanyRelevanceMap {
  google: CompanyRelevance;
  meta: CompanyRelevance;
  amazon: CompanyRelevance;
  uber: CompanyRelevance;
  databricks: CompanyRelevance;
  deShaw: CompanyRelevance;
  microsoft: CompanyRelevance;
  apple: CompanyRelevance;
  bloomberg: CompanyRelevance;
  netflix: CompanyRelevance;
}

export interface PatternHeatmap {
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
  lastActivityDate: string | null;
  currentStreak: number;
  longestStreak: number;
  heatScore: number;
  masteryLevel: MasteryLevel;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  importance: Importance;
  estimatedHours: number;
  masteryLevel: MasteryLevel;
  interviewFrequency: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  companyRelevance: CompanyRelevanceMap;
  patternRecognitionSignals: PatternRecognitionSignals;
  commonMistakes: CommonMistakes;
  revisionSchedule: RevisionStage[];
  problems: Problem[];
  heatmap: PatternHeatmap;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface TopicHeatmap {
  totalPatterns: number;
  completedPatterns: number;
  completionPercentage: number;
  heatScore: number;
  masteryLevel: MasteryLevel;
  lastActivityDate: string | null;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  importance: Importance;
  estimatedStudyHours: number;
  estimatedPracticeHours: number;
  masteryLevel: MasteryLevel;
  totalPatterns: number;
  companyRelevance: CompanyRelevanceMap;
  patterns: Pattern[];
  heatmap: TopicHeatmap;
}

export interface DomainHeatmap {
  totalTopics: number;
  completedTopics: number;
  completionPercentage: number;
  heatScore: number;
  masteryLevel: MasteryLevel;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  importance: Importance;
  estimatedHours: number;
  totalTopics: number;
  topics: Topic[];
  heatmap: DomainHeatmap;
}

export interface DailyActivity {
  date: string;
  problemsSolved: number;
  problemsRevised: number;
  patternsStudied: number;
  minutesSpent: number;
  difficultyPoints: number;
}

export interface DashboardMetrics {
  totalProblemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  patternsMastered: number;
  topicsMastered: number;
  domainsMastered: number;
  currentStreak: number;
  longestStreak: number;
  averageSolveTime: number;
  averageRevisionTime: number;
  interviewReadinessPercent: number;
  overallDSACompletionPercent: number;
  overallMasteryScore: number;
  heatScore: number;
  lastActiveDate: string | null;
}

export interface DSATracker {
  pillar: {
    id: string;
    name: string;
    description: string;
    domains: Domain[];
  };
  dailyActivities: DailyActivity[];
  dashboard: DashboardMetrics;
}

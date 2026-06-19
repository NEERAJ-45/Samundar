import type { DSATracker, Domain, Topic, Pattern, Problem, DashboardMetrics, DailyActivity } from '@/lib/types/dsa-tracker';

export interface DSATrackerRepository {
  getTracker(): Promise<DSATracker>;
  getDomain(domainId: string): Promise<Domain | null>;
  getTopic(domainId: string, topicId: string): Promise<Topic | null>;
  getPattern(domainId: string, topicId: string, patternId: string): Promise<Pattern | null>;
  getProblem(domainId: string, topicId: string, patternId: string, problemId: string): Promise<Problem | null>;

  updateProblemActivity(domainId: string, topicId: string, patternId: string, problemId: string, activity: Partial<Problem>): Promise<void>;
  updatePatternHeatmap(domainId: string, topicId: string, patternId: string, heatmap: Partial<Pattern['heatmap']>): Promise<void>;
  updateTopicHeatmap(domainId: string, topicId: string, heatmap: Partial<Topic['heatmap']>): Promise<void>;
  updateDomainHeatmap(domainId: string, heatmap: Partial<Domain['heatmap']>): Promise<void>;

  logDailyActivity(activity: DailyActivity): Promise<void>;
  getDailyActivities(days?: number): Promise<DailyActivity[]>;

  getDashboardMetrics(): Promise<DashboardMetrics>;
  recalculateAllMetrics(): Promise<void>;
}

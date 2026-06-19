import type { KnowledgeNode, MasteryRecord, RevisionSchedule, Project, InterviewQuestion, Book, ResearchPaper, LearningSession, Mission, CareerGoal, AnalyticsSummary, SyncEvent } from '@/lib/types/knowledge';

export interface KnowledgeRepository {
  getKnowledgeNodes(): Promise<KnowledgeNode[]>;
  getKnowledgeNode(id: string): Promise<KnowledgeNode | null>;
  getChildren(parentId: string): Promise<KnowledgeNode[]>;
  getDescendants(parentId: string): Promise<KnowledgeNode[]>;
  searchKnowledgeNodes(query: string): Promise<KnowledgeNode[]>;

  getMasteryRecords(): Promise<MasteryRecord[]>;
  getMasteryRecord(nodeId: string): Promise<MasteryRecord | null>;
  updateMastery(nodeId: string, level: number, note?: string): Promise<void>;

  getRevisionSchedules(): Promise<RevisionSchedule[]>;
  getDueRevisions(): Promise<RevisionSchedule[]>;
  completeRevision(id: string): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  updateProject(id: string, data: Partial<Project>): Promise<void>;

  getInterviewQuestions(nodeId?: string): Promise<InterviewQuestion[]>;

  getBooks(): Promise<Book[]>;
  getResearchPapers(): Promise<ResearchPaper[]>;

  logSession(session: Omit<LearningSession, 'id' | 'createdAt'>): Promise<void>;
  getSessions(days?: number): Promise<LearningSession[]>;

  getMissions(): Promise<Mission[]>;
  getCareerGoals(): Promise<CareerGoal | null>;

  getAnalytics(): Promise<AnalyticsSummary>;

  getSyncLog(): Promise<SyncEvent[]>;
  appendSyncEvent(event: SyncEvent): Promise<void>;
  clearSyncLog(): Promise<void>;
}

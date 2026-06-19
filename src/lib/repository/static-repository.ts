import fs from 'fs/promises';
import path from 'path';
import type {
  KnowledgeNode,
  MasteryRecord,
  RevisionSchedule,
  Project,
  InterviewQuestion,
  Book,
  ResearchPaper,
  LearningSession,
  Mission,
  CareerGoal,
  AnalyticsSummary,
  SyncEvent,
} from '@/lib/types/knowledge';
import type { KnowledgeRepository } from './interface';

export class StaticKnowledgeRepository implements KnowledgeRepository {
  private dataDir: string;
  private cache: Map<string, unknown>;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'ProdigyOS-data');
    this.cache = new Map();
  }

  private async readJSON<T>(filename: string, fallback: T): Promise<T> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return fallback;
    }
  }

  private async readCached<T>(filename: string, key: string, fallback: T): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const data = await this.readJSON<T>(filename, fallback);
    this.cache.set(key, data);
    return data;
  }

  private invalidateCache(...keys: string[]): void {
    for (const key of keys) {
      this.cache.delete(key);
    }
  }

  private async appendToSyncLog(event: SyncEvent): Promise<void> {
    const filePath = path.join(this.dataDir, 'sync-log.json');
    let log: SyncEvent[] = [];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      log = JSON.parse(content);
    } catch {
      // file doesn't exist yet
    }
    log.push(event);
    await fs.writeFile(filePath, JSON.stringify(log, null, 2), 'utf-8');
  }

  private calculateStreak(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;

    const uniqueDays = new Set(
      sessions.map((s) => s.date.split('T')[0])
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sortedDays[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async getKnowledgeNodes(): Promise<KnowledgeNode[]> {
    return this.readCached<KnowledgeNode[]>('nodes.json', 'nodes', []);
  }

  async getKnowledgeNode(id: string): Promise<KnowledgeNode | null> {
    const nodes = await this.getKnowledgeNodes();
    return nodes.find((n) => n.id === id) ?? null;
  }

  async getChildren(parentId: string): Promise<KnowledgeNode[]> {
    const nodes = await this.getKnowledgeNodes();
    return nodes.filter((n) => n.parentId === parentId);
  }

  async getDescendants(parentId: string): Promise<KnowledgeNode[]> {
    const nodes = await this.getKnowledgeNodes();
    const result: KnowledgeNode[] = [];
    const stack = nodes.filter((n) => n.parentId === parentId);
    while (stack.length > 0) {
      const node = stack.pop()!;
      result.push(node);
      const children = nodes.filter((n) => n.parentId === node.id);
      stack.push(...children);
    }
    return result;
  }

  async searchKnowledgeNodes(query: string): Promise<KnowledgeNode[]> {
    const nodes = await this.getKnowledgeNodes();
    const lower = query.toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lower) ||
        (n.description && n.description.toLowerCase().includes(lower))
    );
  }

  async getMasteryRecords(): Promise<MasteryRecord[]> {
    return this.readCached<MasteryRecord[]>('mastery-records.json', 'mastery', []);
  }

  async getMasteryRecord(nodeId: string): Promise<MasteryRecord | null> {
    const records = await this.getMasteryRecords();
    return records.find((r) => r.knowledgeNodeId === nodeId) ?? null;
  }

  async updateMastery(nodeId: string, level: number, note?: string): Promise<void> {
    await this.appendToSyncLog({
      eventId: crypto.randomUUID(),
      eventType: 'UPDATE_MASTERY',
      conceptId: nodeId,
      newValue: { level, note },
      timestamp: new Date().toISOString(),
    });
    this.invalidateCache('mastery');
  }

  async getRevisionSchedules(): Promise<RevisionSchedule[]> {
    return this.readCached<RevisionSchedule[]>('revision-schedules.json', 'revision-schedules', []);
  }

  async getDueRevisions(): Promise<RevisionSchedule[]> {
    const schedules = await this.getRevisionSchedules();
    const now = new Date();
    return schedules.filter((s) => !s.completed && new Date(s.dueDate) <= now);
  }

  async completeRevision(id: string): Promise<void> {
    const schedules = await this.getRevisionSchedules();
    const schedule = schedules.find((s) => s.id === id);
    await this.appendToSyncLog({
      eventId: crypto.randomUUID(),
      eventType: 'COMPLETE_REVISION',
      conceptId: schedule?.knowledgeNodeId ?? '',
      newValue: { completed: true, completedAt: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
    this.invalidateCache('revision-schedules');
  }

  async getProjects(): Promise<Project[]> {
    return this.readCached<Project[]>('projects.json', 'projects', []);
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) ?? null;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    await this.appendToSyncLog({
      eventId: crypto.randomUUID(),
      eventType: 'UPDATE_PROJECT',
      conceptId: id,
      newValue: data,
      timestamp: new Date().toISOString(),
    });
    this.invalidateCache('projects');
  }

  async getInterviewQuestions(nodeId?: string): Promise<InterviewQuestion[]> {
    const questions = await this.readCached<InterviewQuestion[]>('interview-questions.json', 'interview-questions', []);
    if (nodeId) {
      return questions.filter((q) => q.knowledgeNodeId === nodeId);
    }
    return questions;
  }

  async getBooks(): Promise<Book[]> {
    return this.readCached<Book[]>('books.json', 'books', []);
  }

  async getResearchPapers(): Promise<ResearchPaper[]> {
    return this.readCached<ResearchPaper[]>('research-papers.json', 'research-papers', []);
  }

  async logSession(session: Omit<LearningSession, 'id' | 'createdAt'>): Promise<void> {
    await this.appendToSyncLog({
      eventId: crypto.randomUUID(),
      eventType: 'LOG_SESSION',
      conceptId: session.unitsCovered[0] ?? '',
      newValue: session,
      timestamp: new Date().toISOString(),
    });
    this.invalidateCache('sessions');
  }

  async getSessions(days?: number): Promise<LearningSession[]> {
    const sessions = await this.readCached<LearningSession[]>('sessions.json', 'sessions', []);
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return sessions.filter((s) => new Date(s.date) >= cutoff);
    }
    return sessions;
  }

  async getMissions(): Promise<Mission[]> {
    return this.readCached<Mission[]>('missions.json', 'missions', []);
  }

  async getCareerGoals(): Promise<CareerGoal | null> {
    return this.readCached<CareerGoal | null>('career-goals.json', 'career-goals', null);
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    const [nodes, mastery, projects, revisions, sessions] = await Promise.all([
      this.getKnowledgeNodes(),
      this.getMasteryRecords(),
      this.getProjects(),
      this.getRevisionSchedules(),
      this.getSessions(),
    ]);

    const totalLearningHours = sessions.reduce((sum, s) => sum + s.hours, 0);

    const completedRevisions = revisions.filter((r) => r.completed && r.completedAt !== null);
    const revisionAccuracy = revisions.length > 0 ? completedRevisions.length / revisions.length : 0;

    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
    const projectProgress = projects.length > 0 ? completedProjects / projects.length : 0;

    const nodesWithReadiness = mastery.filter((m) => m.interviewReadiness);
    const interviewReadiness = mastery.length > 0 ? nodesWithReadiness.length / mastery.length : 0;

    const weakAreas = mastery
      .filter((m) => m.level < 2)
      .map((m) => {
        const node = nodes.find((n) => n.id === m.knowledgeNodeId);
        return node?.name ?? m.knowledgeNodeId;
      });

    const strongAreas = mastery
      .filter((m) => m.level >= 4)
      .map((m) => {
        const node = nodes.find((n) => n.id === m.knowledgeNodeId);
        return node?.name ?? m.knowledgeNodeId;
      });

    const totalMastery =
      mastery.length > 0 ? mastery.reduce((sum, m) => sum + m.level, 0) / mastery.length : 0;

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const masteryGrowth: { date: string; averageMastery: number }[] = [];
    const knowledgeGrowth: { date: string; totalNodes: number }[] = [];

    if (sortedSessions.length > 0) {
      for (const session of sortedSessions) {
        masteryGrowth.push({
          date: session.date,
          averageMastery: totalMastery,
        });
        knowledgeGrowth.push({
          date: session.date,
          totalNodes: nodes.length,
        });
      }
    } else {
      masteryGrowth.push({
        date: new Date().toISOString().split('T')[0],
        averageMastery: totalMastery,
      });
      knowledgeGrowth.push({
        date: new Date().toISOString().split('T')[0],
        totalNodes: nodes.length,
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = sessions.filter((s) => new Date(s.date) >= thirtyDaysAgo);

    return {
      totalLearningHours,
      masteryGrowth,
      knowledgeGrowth,
      revisionAccuracy,
      projectProgress,
      interviewReadiness,
      weakAreas,
      strongAreas,
      currentStreak: this.calculateStreak(sessions),
      weeklyProgress: recentSessions.length / 4,
      monthlyProgress: recentSessions.length,
    };
  }

  async getSyncLog(): Promise<SyncEvent[]> {
    return this.readJSON<SyncEvent[]>('sync-log.json', []);
  }

  async appendSyncEvent(event: SyncEvent): Promise<void> {
    await this.appendToSyncLog(event);
  }

  async clearSyncLog(): Promise<void> {
    const filePath = path.join(this.dataDir, 'sync-log.json');
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
}

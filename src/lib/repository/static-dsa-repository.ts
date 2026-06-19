import fs from 'fs/promises';
import path from 'path';
import type {
  DSATracker,
  Domain,
  Topic,
  Pattern,
  Problem,
  DashboardMetrics,
  DailyActivity,
  MasteryLevel,
} from '@/lib/types/dsa-tracker';
import type { DSATrackerRepository } from './dsa-tracker-interface';

export class StaticDSATrackerRepository implements DSATrackerRepository {
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

  private findInDomains<T>(
    domains: Domain[],
    fn: (domain: Domain) => T | null
  ): T | null {
    for (const domain of domains) {
      const result = fn(domain);
      if (result !== null) return result;
    }
    return null;
  }

  async getTracker(): Promise<DSATracker> {
    return this.readCached<DSATracker>('dsa-tracker.json', 'dsa-tracker', {
      pillar: { id: '', name: '', description: '', domains: [] },
      dailyActivities: [],
      dashboard: {
        totalProblemsSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
        patternsMastered: 0, topicsMastered: 0, domainsMastered: 0,
        currentStreak: 0, longestStreak: 0, averageSolveTime: 0, averageRevisionTime: 0,
        interviewReadinessPercent: 0, overallDSACompletionPercent: 0,
        overallMasteryScore: 0, heatScore: 0, lastActiveDate: null,
      },
    });
  }

  async getDomain(domainId: string): Promise<Domain | null> {
    const tracker = await this.getTracker();
    return tracker.pillar.domains.find((d) => d.id === domainId) ?? null;
  }

  async getTopic(domainId: string, topicId: string): Promise<Topic | null> {
    const domain = await this.getDomain(domainId);
    return domain?.topics.find((t) => t.id === topicId) ?? null;
  }

  async getPattern(
    domainId: string,
    topicId: string,
    patternId: string
  ): Promise<Pattern | null> {
    const topic = await this.getTopic(domainId, topicId);
    return topic?.patterns.find((p) => p.id === patternId) ?? null;
  }

  async getProblem(
    domainId: string,
    topicId: string,
    patternId: string,
    problemId: string
  ): Promise<Problem | null> {
    const pattern = await this.getPattern(domainId, topicId, patternId);
    return pattern?.problems.find((p) => p.id === problemId) ?? null;
  }

  async updateProblemActivity(
    domainId: string,
    topicId: string,
    patternId: string,
    problemId: string,
    activity: Partial<Problem>
  ): Promise<void> {
    const tracker = await this.getTracker();
    const domain = tracker.pillar.domains.find((d) => d.id === domainId);
    if (!domain) throw new Error(`Domain ${domainId} not found`);

    const topic = domain.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error(`Topic ${topicId} not found`);

    const pattern = topic.patterns.find((p) => p.id === patternId);
    if (!pattern) throw new Error(`Pattern ${patternId} not found`);

    const problem = pattern.problems.find((p) => p.id === problemId);
    if (!problem) throw new Error(`Problem ${problemId} not found`);

    Object.assign(problem, activity);
    if (activity.activity?.activityLog) {
      problem.activity.activityLog.push(...activity.activity.activityLog);
    }

    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  async updatePatternHeatmap(
    domainId: string,
    topicId: string,
    patternId: string,
    heatmap: Partial<Pattern['heatmap']>
  ): Promise<void> {
    const tracker = await this.getTracker();
    const domain = tracker.pillar.domains.find((d) => d.id === domainId);
    if (!domain) throw new Error(`Domain ${domainId} not found`);

    const topic = domain.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error(`Topic ${topicId} not found`);

    const pattern = topic.patterns.find((p) => p.id === patternId);
    if (!pattern) throw new Error(`Pattern ${patternId} not found`);

    Object.assign(pattern.heatmap, heatmap);
    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  async updateTopicHeatmap(
    domainId: string,
    topicId: string,
    heatmap: Partial<Topic['heatmap']>
  ): Promise<void> {
    const tracker = await this.getTracker();
    const domain = tracker.pillar.domains.find((d) => d.id === domainId);
    if (!domain) throw new Error(`Domain ${domainId} not found`);

    const topic = domain.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error(`Topic ${topicId} not found`);

    Object.assign(topic.heatmap, heatmap);
    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  async updateDomainHeatmap(
    domainId: string,
    heatmap: Partial<Domain['heatmap']>
  ): Promise<void> {
    const tracker = await this.getTracker();
    const domain = tracker.pillar.domains.find((d) => d.id === domainId);
    if (!domain) throw new Error(`Domain ${domainId} not found`);

    Object.assign(domain.heatmap, heatmap);
    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  async logDailyActivity(activity: DailyActivity): Promise<void> {
    const tracker = await this.getTracker();
    const existing = tracker.dailyActivities.findIndex(
      (a) => a.date === activity.date
    );
    if (existing >= 0) {
      tracker.dailyActivities[existing] = activity;
    } else {
      tracker.dailyActivities.push(activity);
    }
    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  async getDailyActivities(days?: number): Promise<DailyActivity[]> {
    const tracker = await this.getTracker();
    if (!days) return tracker.dailyActivities;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return tracker.dailyActivities.filter(
      (a) => new Date(a.date) >= cutoff
    );
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const tracker = await this.getTracker();
    return this.computeDashboard(tracker.pillar.domains);
  }

  private computeDashboard(domains: Domain[]): DashboardMetrics {
    let totalProblems = 0, completedProblems = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    let patternsCompleted = 0, totalPatterns = 0;
    let topicsCompleted = 0;
    let domainsMastered = 0;
    let lastActiveDate: string | null = null;

    for (const domain of domains) {
      let domainCompletedTopics = 0;

      for (const topic of domain.topics) {
        let topicCompletedPatterns = 0;

        for (const pattern of topic.patterns) {
          totalPatterns++;
          let patternCompleted = 0;

          for (const problem of pattern.problems) {
            totalProblems++;
            if (problem.completed) {
              completedProblems++;
              patternCompleted++;
              if (problem.difficulty === 'EASY') easySolved++;
              else if (problem.difficulty === 'MEDIUM') mediumSolved++;
              else if (problem.difficulty === 'HARD') hardSolved++;
            }
            if (problem.activity?.lastSolvedDate) {
              if (!lastActiveDate || problem.activity.lastSolvedDate > lastActiveDate) {
                lastActiveDate = problem.activity.lastSolvedDate;
              }
            }
          }

          const pct = pattern.problems.length > 0 ? (patternCompleted / pattern.problems.length) * 100 : 0;
          if (pct >= 80) {
            patternsCompleted++;
            topicCompletedPatterns++;
          }
        }

        const tPct = topic.patterns.length > 0 ? (topicCompletedPatterns / topic.patterns.length) * 100 : 0;
        if (tPct >= 80) {
          topicsCompleted++;
          domainCompletedTopics++;
        }
      }

      const dPct = domain.topics.length > 0 ? (domainCompletedTopics / domain.topics.length) * 100 : 0;
      if (dPct >= 80) domainsMastered++;
    }

    const overallCompletion = totalProblems > 0 ? (completedProblems / totalProblems) * 100 : 0;
    const masteryScore = totalPatterns > 0 ? (patternsCompleted / totalPatterns) * 100 : 0;

    return {
      totalProblemsSolved: completedProblems,
      easySolved, mediumSolved, hardSolved,
      patternsMastered: patternsCompleted,
      topicsMastered: topicsCompleted,
      domainsMastered,
      currentStreak: 0, longestStreak: 0,
      averageSolveTime: 0, averageRevisionTime: 0,
      interviewReadinessPercent: Math.round(masteryScore),
      overallDSACompletionPercent: Math.round(overallCompletion),
      overallMasteryScore: Math.round(masteryScore),
      heatScore: 0,
      lastActiveDate,
    };
  }

  async recalculateAllMetrics(): Promise<void> {
    const tracker = await this.getTracker();
    const domains = tracker.pillar.domains;
    let totalHeatScore = 0, heatCount = 0;

    for (const domain of domains) {
      for (const topic of domain.topics) {
        let topicCompletedPatterns = 0;

        for (const pattern of topic.patterns) {
          let patternCompleted = 0;

          for (const problem of pattern.problems) {
            if (problem.completed) patternCompleted++;
          }

          const pct = pattern.problems.length > 0
            ? (patternCompleted / pattern.problems.length) * 100 : 0;

          pattern.heatmap.completedProblems = patternCompleted;
          pattern.heatmap.completionPercentage = Math.round(pct);
          pattern.heatmap.masteryLevel = this.calculateMasteryLevel(pct, pattern.difficulty) as MasteryLevel;
          totalHeatScore += pattern.heatmap.heatScore;
          heatCount++;

          if (pct >= 80) topicCompletedPatterns++;
        }

        const tPct = topic.patterns.length > 0
          ? (topicCompletedPatterns / topic.patterns.length) * 100 : 0;
        topic.heatmap.completedPatterns = topicCompletedPatterns;
        topic.heatmap.completionPercentage = Math.round(tPct);
        topic.heatmap.masteryLevel = this.calculateMasteryLevel(tPct, topic.difficulty) as MasteryLevel;
      }

      const dPct = domain.topics.length > 0
        ? (domain.topics.filter(t => t.heatmap.completionPercentage >= 80).length / domain.topics.length) * 100 : 0;
      domain.heatmap.completedTopics = domain.topics.filter(t => t.heatmap.completionPercentage >= 80).length;
      domain.heatmap.completionPercentage = Math.round(dPct);
      domain.heatmap.masteryLevel = this.calculateMasteryLevel(dPct, domain.difficulty) as MasteryLevel;
    }

    const dash = this.computeDashboard(domains);
    dash.heatScore = heatCount > 0 ? Math.round(totalHeatScore / heatCount) : 0;
    tracker.dashboard = dash;

    this.invalidateCache('dsa-tracker');
    await this.writeTracker(tracker);
  }

  private calculateMasteryLevel(completionPct: number, difficulty: string): number {
    if (completionPct >= 95) return 9;
    if (completionPct >= 90) return 8;
    if (completionPct >= 80) return 7;
    if (completionPct >= 70) return 6;
    if (completionPct >= 60) return 5;
    if (completionPct >= 50) return 4;
    if (completionPct >= 30) return 3;
    if (completionPct >= 10) return 2;
    if (completionPct > 0) return 1;
    return 0;
  }

  private async writeTracker(tracker: DSATracker): Promise<void> {
    if (!tracker.pillar.domains || tracker.pillar.domains.length === 0) {
      console.warn('[StaticDSATracker] Aborting write — empty domains would corrupt data');
      return;
    }
    const filePath = path.join(this.dataDir, 'dsa-tracker.json');
    await fs.writeFile(filePath, JSON.stringify(tracker, null, 2), 'utf-8');
  }
}

import type { KnowledgeRepository } from './interface';
import type { DSATrackerRepository } from './dsa-tracker-interface';
import { StaticKnowledgeRepository } from './static-repository';
import { StaticDSATrackerRepository } from './static-dsa-repository';

let repositoryInstance: KnowledgeRepository | null = null;
let dsaTrackerInstance: DSATrackerRepository | null = null;

export function getRepository(mode: 'HOME' | 'OFFICE' = 'OFFICE'): KnowledgeRepository {
  if (!repositoryInstance) {
    repositoryInstance = new StaticKnowledgeRepository();
  }
  return repositoryInstance;
}

export function getDSATrackerRepository(): DSATrackerRepository {
  if (!dsaTrackerInstance) {
    dsaTrackerInstance = new StaticDSATrackerRepository();
  }
  return dsaTrackerInstance;
}

export function resetRepository(): void {
  repositoryInstance = null;
  dsaTrackerInstance = null;
}

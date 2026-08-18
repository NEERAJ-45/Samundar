export const ANALYZE_LIMIT = 10;
export const OPTIMIZE_LIMIT = 5;

export function limitForAction(action: 'analyze' | 'optimize'): number {
  return action === 'optimize' ? OPTIMIZE_LIMIT : ANALYZE_LIMIT;
}

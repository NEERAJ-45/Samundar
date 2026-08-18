export interface DiffResult {
  added: Set<string>;
  removed: Set<string>;
}

function tokens(s: string): string[] {
  return s
    .replace(/\\[a-zA-Z@]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map((w) => w.replace(/[^a-z0-9+#]/g, ''))
    .filter(Boolean);
}

// Fraction of a's content tokens that also appear in b.
function overlap(a: string, b: string): number {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (A.size === 0) return 0;
  let common = 0;
  for (const t of A) if (B.has(t)) common++;
  return common / A.size;
}

// Share of the ORIGINAL line's content tokens kept by a candidate rewrite line.
// Recall on the original is the invariant we protect — a long reworded bullet
// still covers most of the old line's tokens, even though it adds plenty.
const REWRITE_OVERLAP = 0.5;

// Merge an LLM rewrite ONTO the original so only the changes are applied:
// every original line survives, lines that were reworded get replaced, and
// brand-new lines are inserted in place. Nothing is ever deleted.
export function mergeChanges(original: string, optimized: string): string {
  const optDoc = optimized.indexOf('\\begin{document}');
  const optLines = (optDoc >= 0 ? optimized.slice(optDoc) : optimized).split('\n');
  const origLines = original.split('\n');
  if (origLines.length === 0) return optimized;

  const owner = new Array<number>(optLines.length).fill(-1);
  const used = new Set<number>();
  let last = 0;
  for (let i = 0; i < optLines.length; i++) {
    let bestIdx = -1;
    let bestScore = 0;
    for (let j = last; j < origLines.length; j++) {
      if (used.has(j)) continue;
      const s = overlap(origLines[j], optLines[i]);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = j;
      }
    }
    if (bestIdx !== -1 && bestScore >= REWRITE_OVERLAP) {
      owner[i] = bestIdx;
      used.add(bestIdx);
      last = bestIdx;
    }
  }

  const insertsBefore = new Map<number, string[]>();
  const pending: string[] = [];
  for (let i = 0; i < optLines.length; i++) {
    if (owner[i] === -1) {
      pending.push(optLines[i]);
    } else {
      const list = insertsBefore.get(owner[i]) ?? [];
      list.push(...pending);
      pending.length = 0;
      insertsBefore.set(owner[i], list);
    }
  }

  const result: string[] = [];
  for (let j = 0; j < origLines.length; j++) {
    result.push(...(insertsBefore.get(j) ?? []));
    let repl = -1;
    for (let i = 0; i < optLines.length; i++) {
      if (owner[i] === j) {
        repl = i;
        break;
      }
    }
    result.push(repl === -1 ? origLines[j] : optLines[repl]);
  }
  result.push(...pending);
  return result.join('\n');
}

export function diffWords(a: string, b: string): DiffResult {
  const A = tokens(a);
  const B = tokens(b);
  const n = A.length;
  const m = B.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const added = new Set<string>();
  const removed = new Set<string>();
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      removed.add(A[i]);
      i++;
    } else {
      added.add(B[j]);
      j++;
    }
  }
  while (i < n) removed.add(A[i++]);
  while (j < m) added.add(B[j++]);

  return { added, removed };
}

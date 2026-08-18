export interface KeywordCheck {
  present: string[];
  missing: string[];
  coverage: number;
}

const LOW_VALUE = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'for', 'on', 'with', 'as', 'at', 'by', 'from',
  'experience', 'required', 'must', 'have', 'ability', 'working', 'strong', 'using', 'use', 'team',
]);

export function toPlainText(source: string): string {
  return source
    .replace(/\\%[^\n]*/g, ' ')
    .replace(/\\[a-zA-Z@]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/&/g, ' ')
    .replace(/[^A-Za-z0-9+#./ -]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .split(/[\s/-]+/)
    .filter((w) => w.length > 1)
    .join(' ');
}

function extractCandidates(jd: string): string[] {
  const sentences = jd.split(/[.\n;:]+/);
  const cands = new Set<string>();
  for (const sentence of sentences) {
    const words = sentence.split(/[^A-Za-z0-9+#.]+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      const width = words[i].length >= 8 ? 1 : 2;
      for (let len = 1; len <= width; len++) {
        const phrase = words.slice(i, i + len).join(' ');
        const norm = normalizePhrase(phrase);
        if (norm && !LOW_VALUE.has(phrase.toLowerCase()) && !LOW_VALUE.has(norm)) {
          cands.add(norm);
        }
      }
    }
  }
  return [...cands];
}

export function keywordCheck(jd: string, resumeSource: string): KeywordCheck {
  const plain = toPlainText(resumeSource);
  const candidates = extractCandidates(jd);
  const present: string[] = [];
  const missing: string[] = [];
  for (const c of candidates) {
    if (plain.includes(` ${c} `) || plain.includes(c + ' ') || plain.includes(' ' + c)) {
      present.push(c);
    } else {
      missing.push(c);
    }
  }
  const total = present.length + missing.length;
  return {
    present,
    missing,
    coverage: total === 0 ? 0 : Math.round((present.length / total) * 100),
  };
}

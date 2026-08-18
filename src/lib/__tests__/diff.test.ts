import { describe, it, expect } from 'vitest';
import { diffWords, mergeChanges } from '../diff';

describe('diffWords', () => {
  it('flags added and removed words', () => {
    const r = diffWords('I know Java and SQL.', 'I know Java, Spring and REST.');
    expect(r.removed.has('sql')).toBe(true);
    expect(r.added.has('spring')).toBe(true);
    expect(r.added.has('rest')).toBe(true);
    expect(r.removed.has('java')).toBe(false);
  });

  it('returns empty sets when identical', () => {
    const r = diffWords('same text', 'same text');
    expect(r.added.size).toBe(0);
    expect(r.removed.size).toBe(0);
  });
});

describe('mergeChanges', () => {
  const original = [
    '\\documentclass{article}',
    '\\usepackage{fontawesome}',
    '\\begin{document}',
    '\\section*{Experience}',
    'Built pipelines with PostgreSQL',
    '\\section*{Projects}',
    'GoatCart checkout throttled by Redis',
    '\\end{document}',
  ].join('\n');

  it('keeps every original line and applies only rewrites and additions', () => {
    const optimized = [
      '\\documentclass{article}',
      '\\begin{document}',
      '\\section*{Experience}',
      'Designed and shipped reliable ETL pipelines at scale with PostgreSQL',
      '\\section*{Projects}',
      'GoatCart checkout throttled by Redis queue',
      '\\section*{Certifications}',
      'AWS Certified Solutions Architect',
      '\\end{document}',
    ].join('\n');
    const merged = mergeChanges(original, optimized);
    expect(merged).toContain('\\usepackage{fontawesome}');
    expect(merged).toContain('Designed and shipped reliable ETL pipelines');
    expect(merged).not.toContain('Built pipelines with PostgreSQL');
    expect(merged).toContain('GoatCart checkout throttled by Redis queue');
    expect(merged).toContain('AWS Certified Solutions Architect');
    expect(merged.split('\n')).toHaveLength(original.split('\n').length + 2);
  });

  it('never removes original content even when the optimized source drops it', () => {
    const optimized = [
      '\\begin{document}',
      '\\section*{Experience}',
      'Software engineer with deep experience',
      '\\end{document}',
    ].join('\n');
    const merged = mergeChanges(original, optimized);
    expect(merged).toContain('GoatCart checkout throttled by Redis');
    expect(merged).toContain('Built pipelines with PostgreSQL');
    expect(merged).toContain('Software engineer with deep experience');
  });
});

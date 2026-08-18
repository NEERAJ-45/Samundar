import { describe, it, expect } from 'vitest';
import { mergePreamble, isValidOptimize } from '../ats/analyze';

describe('mergePreamble', () => {
  it('keeps original preamble and swaps in optimized body', () => {
    const original = '\\documentclass{article}\n\\usepackage{fontawesome}\n\\begin{document}\nORIGINAL BODY\n\\end{document}';
    const optimized = '\\documentclass{article}\n\\usepackage{enumitem}\n\\begin{document}\nNEW BODY\n\\end{document}';
    const merged = mergePreamble(original, optimized);
    expect(merged).toContain('\\usepackage{fontawesome}');
    expect(merged).not.toContain('\\usepackage{enumitem}');
    expect(merged).toContain('NEW BODY');
    expect(merged).not.toContain('ORIGINAL BODY');
  });

  it('returns optimized unchanged when original has no document body', () => {
    const optimized = '\\begin{document}\nBODY\n\\end{document}';
    expect(mergePreamble('no preamble', optimized)).toBe(optimized);
  });
});

describe('isValidOptimize', () => {
  const original = [
    '\\documentclass{article}',
    '\\begin{document}',
    '\\section*{Education}',
    'Google Software Engineer 2019--2023 built pipelines with PostgreSQL',
    '\\section*{Projects}',
    'GoatCart checkout throttled by Redis queue',
    '\\end{document}',
  ].join('\n');

  it('accepts a rewrite that keeps all sections and content', () => {
    const optimized = [
      '\\begin{document}',
      '\\section*{Education}',
      'Google Software Engineer (2019--2023). Designed and shipped reliable ETL pipelines at scale with PostgreSQL.',
      '\\section*{Projects}',
      'GoatCart: high-throughput checkout throttled by Redis. Reduced cost 40%.',
      '\\end{document}',
    ].join('\n');
    expect(isValidOptimize(original, optimized, true)).toBe(true);
  });

  it('rejects a rewrite that drops a section', () => {
    const optimized = [
      '\\begin{document}',
      '\\section*{Education}',
      'Google Software Engineer 2019--2023 built pipelines with PostgreSQL',
      '\\end{document}',
    ].join('\n');
    expect(isValidOptimize(original, optimized, true)).toBe(false);
  });

  it('rejects when the model reports content was dropped', () => {
    const optimized = [
      '\\begin{document}',
      '\\section*{Education}',
      'Software engineer with deep experience',
      '\\section*{Projects}',
      'Built several impactful products',
      '\\end{document}',
    ].join('\n');
    expect(isValidOptimize(original, optimized, false)).toBe(false);
  });

  it('rejects a rewrite that keeps section names but drops the content inside', () => {
    const optimized = [
      '\\begin{document}',
      '\\section*{Education}',
      'Software engineer with deep experience',
      '\\section*{Projects}',
      'Built several impactful products',
      '\\end{document}',
    ].join('\n');
    expect(isValidOptimize(original, optimized, true)).toBe(false);
  });
});

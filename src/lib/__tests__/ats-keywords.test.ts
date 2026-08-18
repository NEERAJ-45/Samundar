import { describe, it, expect } from 'vitest';
import { keywordCheck } from '../ats/keywords';

describe('keywordCheck', () => {
  it('flags JD terms present in the resume text', () => {
    const jd = 'We need Java, Spring Boot, REST APIs and familiarity with C#.';
    const resume = '\\section*{Skills}\nJava, Spring (Boot), REST APIs.\\end{document}';
    const r = keywordCheck(jd, resume);
    expect(r.present).toContain('java');
    expect(r.present).toContain('spring boot');
    expect(r.missing).toContain('c#');
  });

  it('handles empty inputs safely', () => {
    const r = keywordCheck('', '');
    expect(r.present).toEqual([]);
    expect(r.missing).toEqual([]);
    expect(r.coverage).toBe(0);
  });
});

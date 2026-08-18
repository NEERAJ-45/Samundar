export interface AnalyzePromptArgs {
  resume: string;
  jobDescription: string;
  roleTitle?: string | null;
}

const SCORE_KEYS_DOC = `- atsScore (0-100): overall ATS parsing friendliness.
- matchScore (0-100): how well the resume matches the JD.
- structure (0-100): standard sections (contact, summary, skills, experience, education), no exotic formatting.
- keywords (0-100): share of JD keywords covered.
- actionVerbs (0-100): use of strong action verbs in bullets.
- quantifiableImpact (0-100): use of numbers/measurable impact.
- length (0-100): appropriate length (1-2 pages).
- contactInfo (0-100): presence of clear contact/identity info.`;

export function analyzePrompt({ resume, jobDescription, roleTitle }: AnalyzePromptArgs): string {
  const roleLine = roleTitle?.trim()
    ? `The candidate is targeting the role: "${roleTitle}". Emphasize keywords relevant to this role even where the JD is generic.\n\n`
    : '';
  return `You are a senior resume writer and ATS expert. Analyze the LaTeX resume against the job description.

Your score must be HONEST. Only count a keyword as "present" if it actually appears in the resume. Never fabricate skills. You may note in recommendations which JD keywords could legitimately be added.

${roleLine}Return STRICT JSON only, no markdown, with this exact shape:
{
  "atsScore": 0,
  "matchScore": 0,
  "structure": 0,
  "keywords": 0,
  "actionVerbs": 0,
  "quantifiableImpact": 0,
  "length": 0,
  "contactInfo": 0,
  "missingKeywords": [],
  "presentKeywords": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}

${SCORE_KEYS_DOC}
- missingKeywords: JD keywords/skills absent from the resume. List ONLY specific, impactful terms (skills, technologies, tools, frameworks, certifications, or concrete qualifications) — never generic filler like "strong", "ability", "experience", "communication", "team", "driven", or common English words the JD uses in prose. Cap at 12. If a keyword is already covered in the resume, do not list it.
- presentKeywords: JD keywords actually found in the resume.
- strengths/weaknesses: short bullets about the resume.
- recommendations: concrete, actionable changes, ordered by impact. Where truthful, include exact LaTeX lines to add.

JOB DESCRIPTION:
${jobDescription}

RESUME (LaTeX source):
${resume}`;
}

export function optimizePrompt({ resume, jobDescription, roleTitle }: AnalyzePromptArgs): string {
  const roleLine = roleTitle?.trim()
    ? `The candidate is targeting the role: "${roleTitle}". Prioritize keywords relevant to this role. If the JD is generic, weight terms related to "${roleTitle}".\n`
    : '';
  return `You are a senior resume writer. Rewrite the LaTeX resume to maximize ATS match with the job description.

${roleLine}Rules:
- Keep the SAME LaTeX document class, packages, and COMPLETE set of sections. Do NOT remove, merge, or rename sections like Education, Projects, Experience, Skills, Certifications, or Summary — even if the JD does not mention them. Preserve every section that exists in the original resume.
- Preserve ALL existing content with IDENTICAL factual density: every course, project, employer, degree, certification, tool, date, city, and numeric detail. Do NOT delete, merge, rewrite-away, or shorten any existing bullet or item. Content preservation outranks the one-page goal.
- Do NOT abbreviate, truncate, or remove prior achievements to fit. Iff it cannot fit on one page, compress the LAYOUT instead of the content: tighten margins, spacing, and font sizes; further condense only filler/boilerplate words, never facts.
- Preserve truthful experience; do NOT invent roles, employers, or degrees.
- Where a JD keyword is genuinely supported by the candidate's background, work it into bullet points and the skills list naturally.
- Use concise, action-oriented bullets with measurable impact where honest.
- Keep it to AT MOST 1.2 pages (A4) via the layout-compression rule above — never by deleting, merging, or shortening real content. Slightly over one page is acceptable; preserving content is more important than page count.
- The optimized LaTeX must contain BOTH \\begin{document} and \\end{document}, with the full document body between them.

Return STRICT JSON only (no markdown) with this exact shape:
{
  "optimizedSource": "",
  "contentPreserved": true,
  "atsScore": 0,
  "matchScore": 0,
  "structure": 0,
  "keywords": 0,
  "actionVerbs": 0,
  "quantifiableImpact": 0,
  "length": 0,
  "contactInfo": 0,
  "missingKeywords": [],
  "presentKeywords": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}

- optimizedSource: the complete rewritten LaTeX source as a single string (escape all double quotes and backslashes).
- contentPreserved: true ONLY if you kept every section name, every real fact (courses, projects, employers, degrees, certifications), and every individual item from the original. Set false if you dropped, merged, renamed, or trimmed any real content, item, or section.
- Scores and lists describe the optimized version.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME (LaTeX source):
${resume}`;
}

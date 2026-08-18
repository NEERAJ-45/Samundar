import { generateJson, type LlmAnalysis } from './engine';
import { analyzePrompt, optimizePrompt } from './prompts';
import { keywordCheck, toPlainText } from './keywords';
import type { AtsResult, AtsRunInput } from './types';

function toResult(action: AtsRunInput['action'], llm: LlmAnalysis, jd: string, resumeText: string): AtsResult {
  // Honest, reproducible JD match: % of JD keywords actually present in the resume text.
  const measured = keywordCheck(jd, resumeText);

  const result: AtsResult = {
    action,
    scores: {
      atsScore: llm.atsScore,
      matchScore: measured.coverage,
      structure: llm.structure,
      keywords: llm.keywords,
      actionVerbs: llm.actionVerbs,
      quantifiableImpact: llm.quantifiableImpact,
      length: llm.length,
      contactInfo: llm.contactInfo,
    },
    missingKeywords: llm.missingKeywords,
    presentKeywords: llm.presentKeywords,
    strengths: llm.strengths,
    weaknesses: llm.weaknesses,
    recommendations: llm.recommendations,
    optimizedSource: llm.optimizedSource,
  };

  // Merge locally-detected JD terms so missingKeywords isn't purely model-hallucinated.
  const jdNormalized = jd.toLowerCase();
  const merged = new Set(result.missingKeywords);
  result.missingKeywords = [...merged].filter((k) => jdNormalized.includes(k.toLowerCase()) && !measured.present.includes(k));
  return result;
}

// ponytail: naive top-level section scan — good enough to catch a dropped section;
// a real LaTeX AST would be overkill here.
function sectionNames(latex: string): Set<string> {
  const names = new Set<string>();
  const re = /\\section\*?\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(latex)) !== null) {
    names.add(m[1].trim().toLowerCase());
  }
  return names;
}

export function isValidOptimize(original: string, optimized: string, contentPreserved: boolean): boolean {
  if (!contentPreserved) return false;
  if (!optimized.toLowerCase().includes('\\begin{document}')) return false;
  if (!sectionsDropped(original, optimized) && !contentDropped(original, optimized)) return true;
  return false;
}

// Reject a rewrite that stripped the actual content but kept section headers —
// the model's contentPreserved flag is self-reported, so verify the facts survive.
const CONTENT_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'with', 'at', 'by', 'from', 'for', 'as', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had', 'will', 'would', 'can', 'could',
  'should', 'this', 'that', 'these', 'those', 'it', 'its', 'our', 'their', 'my', 'your', 'we', 'you',
  'they', 'who', 'whom', 'which', 'what', 'when', 'where', 'how', 'not', 'no', 'but', 'so', 'if', 'than',
  'then', 'also', 'very', 'such', 'into', 'over', 'under', 'etc',
]);

function contentDropped(original: string, optimized: string): boolean {
  const origTokens = toPlainText(original)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !CONTENT_STOP.has(w));
  if (origTokens.length === 0) return false;
  const optText = toPlainText(optimized);
  let kept = 0;
  for (const token of origTokens) {
    if (optText.includes(token)) kept++;
  }
  // ponytail: threshold 0.8 — reworded bullets still pass, gutted ones fail loudly.
  return kept / origTokens.length < 0.8;
}

// Reuse the ORIGINAL preamble (packages that already compile) and drop the
// optimized one, which Gemini often fills with packages the compiler lacks.
export function mergePreamble(original: string, optimized: string): string {
  const origDoc = original.indexOf('\\begin{document}');
  if (origDoc === -1) return optimized;
  const optDoc = optimized.indexOf('\\begin{document}');
  if (optDoc === -1) return optimized;
  return original.slice(0, origDoc) + optimized.slice(optDoc);
}

export async function runAts(input: AtsRunInput): Promise<AtsResult> {
  if (input.action === 'optimize') {
    const llm = await generateJson(optimizePrompt(input), true);
    const valid = !!llm.optimizedSource && isValidOptimize(input.resume, llm.optimizedSource, llm.contentPreserved === true);
    if (valid) {
      const source = mergePreamble(input.resume, llm.optimizedSource!);
      return toResult('optimize', { ...llm, optimizedSource: source }, input.jobDescription, source);
    }
    const analyzeLlm = await generateJson(analyzePrompt(input), false);
    return toResult('optimize', analyzeLlm, input.jobDescription, input.resume);
  }

  const llm = await generateJson(analyzePrompt(input), false);
  return toResult('analyze', llm, input.jobDescription, input.resume);
}

function sectionsDropped(original: string, optimized: string): boolean {
  const orig = sectionNames(original);
  const opt = sectionNames(optimized);
  for (const name of orig) {
    if (!opt.has(name)) return true;
  }
  return false;
}

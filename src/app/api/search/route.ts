import { NextResponse } from "next/server";

interface PatternData {
  name: string;
  easy: ProblemData[];
  medium: ProblemData[];
  hard: ProblemData[];
}

interface ProblemData {
  id: number;
  title: string;
}

interface SearchPattern {
  id: string;
  name: string;
  slug: string;
}

interface SearchProblem {
  id: string;
  title: string;
  difficulty: string;
  pattern: { name: string; slug: string };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ patterns: [], problems: [] });
    }

    const lower = query.toLowerCase();

    const res = await fetch(new URL("/api/patterns", request.url));
    const data = await res.json();

    const allPatterns: SearchPattern[] = [];
    const allProblems: SearchProblem[] = [];

    for (const [key, pattern] of Object.entries(data.patterns as Record<string, PatternData>)) {
      const slug = key;
      if (pattern.name.toLowerCase().includes(lower) || key.replace(/-/g, " ").includes(lower)) {
        allPatterns.push({ id: key, name: pattern.name, slug });
      }
      for (const p of pattern.easy) {
        if (p.title.toLowerCase().includes(lower)) {
          allProblems.push({ id: String(p.id), title: p.title, difficulty: "EASY", pattern: { name: pattern.name, slug } });
        }
      }
      for (const p of pattern.medium) {
        if (p.title.toLowerCase().includes(lower)) {
          allProblems.push({ id: String(p.id), title: p.title, difficulty: "MEDIUM", pattern: { name: pattern.name, slug } });
        }
      }
      for (const p of pattern.hard) {
        if (p.title.toLowerCase().includes(lower)) {
          allProblems.push({ id: String(p.id), title: p.title, difficulty: "HARD", pattern: { name: pattern.name, slug } });
        }
      }
    }

    return NextResponse.json({
      patterns: allPatterns.slice(0, 5),
      problems: allProblems.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

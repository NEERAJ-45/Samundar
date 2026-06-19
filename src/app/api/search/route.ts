import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository/factory";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ patterns: [], problems: [] });
    }

    const repo = getRepository();
    const results = await repo.searchKnowledgeNodes(query);

    const nodes = results.slice(0, 10).map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,
    }));

    return NextResponse.json({ patterns: nodes, problems: [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

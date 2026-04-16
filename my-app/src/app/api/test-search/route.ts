import { NextResponse } from 'next/server';

export async function GET() {
  const results = [];

  // Test specific search for oh-my-codex
  const queries = [
    'oh-my-codex OR oh-my-code OR codex stars:>20000',
    'topic:llm stars:>20000',
    'AI agent stars:>20000',
  ];

  for (const q of queries) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Pulse-App',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items?.map((r: any) => ({
          name: r.full_name,
          stars: r.stargazers_count,
          desc: r.description?.slice(0, 50),
        })) || [];
        results.push({ query: q, count: data.total_count, items });
      } else {
        results.push({ query: q, error: response.statusText });
      }
    } catch (error) {
      results.push({ query: q, error: String(error) });
    }
  }

  return NextResponse.json({ results });
}

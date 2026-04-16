import { NextRequest, NextResponse } from 'next/server';
import { searchContents } from '@/server/services/search.service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const sortBy = (searchParams.get('sortBy') as 'relevance' | 'date') || 'relevance';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const highlight = searchParams.get('highlight') !== 'false';
    
    const filters = {
      category: searchParams.getAll('category'),
      sourceId: searchParams.getAll('sourceId'),
      tags: searchParams.getAll('tag'),
    };

    const result = await searchContents({
      query,
      filters: Object.values(filters).some(v => v.length > 0) ? filters : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
      highlight,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { query, filters, page, limit, sortBy, sortOrder, highlight } = body;

    const result = await searchContents({
      query: query || '',
      filters,
      page: page || 1,
      limit: limit || 20,
      sortBy: sortBy || 'relevance',
      sortOrder: sortOrder || 'desc',
      highlight: highlight !== false,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

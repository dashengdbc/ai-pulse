import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memory-store';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 100);
    const category = searchParams.get('category') || undefined;
    const source = searchParams.get('source') || searchParams.get('sourceId') || undefined;
    const id = searchParams.get('id');

    if (id) {
      const content = await memoryStore.getContentById(id);
      if (!content) {
        return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: content });
    }

    const result = await memoryStore.getContents({ page, limit, category, sourceId: source });

    return NextResponse.json({
      success: true,
      contents: result.items,
      hasMore: result.hasMore,
      total: result.total,
      page: result.page
    });
  } catch (error) {
    console.error('Contents API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.sourceId || !body.url || !body.originalTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sourceId, url, originalTitle' },
        { status: 400 }
      );
    }

    const content = await memoryStore.createContent(body);
    return NextResponse.json({ success: true, data: content }, { status: 201 });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create content' },
      { status: 500 }
    );
  }
}

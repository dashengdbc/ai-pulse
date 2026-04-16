import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memory-store';

export async function POST() {
  // Clear the memory store
  memoryStore.contents.clear();

  return NextResponse.json({
    success: true,
    message: 'Memory store cleared',
    stats: memoryStore.getStats()
  });
}

export async function GET() {
  return NextResponse.json({
    stats: memoryStore.getStats()
  });
}

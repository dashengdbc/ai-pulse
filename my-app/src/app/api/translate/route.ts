import { NextRequest, NextResponse } from 'next/server';
import { translate, translateBatch, TranslationOptions } from '@/server/services/translate.service';

/**
 * POST /api/translate
 * Translate text or batch of texts
 * 
 * Body for single translation:
 * {
 *   text: string;
 *   sourceLang?: string;
 *   targetLang?: string;
 * }
 * 
 * Body for batch translation:
 * {
 *   texts: string[];
 *   sourceLang?: string;
 *   targetLang?: string;
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const { sourceLang = 'auto', targetLang = 'zh' } = body;
    const options: TranslationOptions = { sourceLang, targetLang, useCache: true };

    // Batch translation
    if (body.texts && Array.isArray(body.texts)) {
      if (body.texts.length === 0) {
        return NextResponse.json(
          { error: 'Texts array cannot be empty' },
          { status: 400 }
        );
      }

      if (body.texts.length > 100) {
        return NextResponse.json(
          { error: 'Maximum 100 texts allowed per batch' },
          { status: 400 }
        );
      }

      const { results, errors } = await translateBatch(body.texts, options);

      return NextResponse.json({
        success: true,
        data: {
          results,
          errors,
          totalCount: body.texts.length,
          successCount: results.length,
          errorCount: errors.length,
        },
      });
    }

    // Single translation
    if (body.text && typeof body.text === 'string') {
      const result = await translate(body.text, options);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request body. Provide either "text" or "texts" field' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Translation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/translate
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Translation API is running',
    providers: {
      deepl: !!process.env.DEEPL_API_KEY,
      google: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    },
  });
}

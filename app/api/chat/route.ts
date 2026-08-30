import { NextRequest, NextResponse } from 'next/server';
import { getIELTSCoachResponse, isAIConfigured } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: 'AI not configured. Add GROQ_API_KEY to .env.local.', offline: true },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { message, history, userData } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await getIELTSCoachResponse(message, history || [], userData);

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

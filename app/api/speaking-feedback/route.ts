import { NextRequest, NextResponse } from 'next/server';
import { getSpeakingFeedback } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, part, userData } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const response = await getSpeakingFeedback(question, answer, part || 'Part 1', userData);

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Speaking feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get speaking feedback' },
      { status: 500 }
    );
  }
}

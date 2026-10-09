// ═══════════════════════════════════════════════════════════════════════
//  /api/admin/free-access — admin gate for free-content configuration
//
//  GET  → mock exam list (for the picker)
//  POST → current freeMockIds config
//  PUT  → save { freeMockIds } (writes app_free_access key 'mock_exam')
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { MOCK_EXAMS } from '@/lib/mock-exams';
import {
  getFreeAccessConfig,
  saveFreeAccessConfig,
  isSupabaseConfiguredForFreeAccess,
} from '@/lib/free-access-config';
import { FREE_MOCK_EXAM_IDS } from '@/lib/test-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  return NextResponse.json({
    mocks: MOCK_EXAMS.map((m) => ({ id: m.id, title: m.title })),
    defaultFreeMockIds: FREE_MOCK_EXAM_IDS,
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const config = await getFreeAccessConfig();
  return NextResponse.json({
    freeMockIds: config.freeMockIds ?? [...FREE_MOCK_EXAM_IDS],
    usingDefaults: config.freeMockIds === null,
    supabaseConfigured: isSupabaseConfiguredForFreeAccess(),
  });
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  try {
    const body = await req.json().catch(() => ({}));
    if (!Array.isArray(body.freeMockIds)) {
      return NextResponse.json({ error: 'freeMockIds array required' }, { status: 400 });
    }
    const ids = body.freeMockIds.map(String).filter((id: string) => MOCK_EXAMS.some((m) => m.id === id));
    if (!isSupabaseConfiguredForFreeAccess()) {
      return NextResponse.json(
        { error: "Demo rejimda saqlanmaydi. Supabase'ni sozlang." },
        { status: 500 },
      );
    }
    const ok = await saveFreeAccessConfig({ freeMockIds: ids });
    return ok
      ? NextResponse.json({ ok: true, freeMockIds: ids })
      : NextResponse.json({ error: "DB'ga yozilmadi (service role kalitini tekshiring)" }, { status: 500 });
  } catch (e) {
    console.error('[api/admin/free-access] PUT error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

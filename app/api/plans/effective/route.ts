// Public: admin price overrides keyed by plan id.
// The pricing page merges these into its own catalog so feature lists stay
// in one place while prices remain admin-editable without a redeploy.

import { NextResponse } from 'next/server';
import { getPlanOverrides } from '@/lib/plan-overrides';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const overrides = await getPlanOverrides();
  return NextResponse.json({ overrides });
}

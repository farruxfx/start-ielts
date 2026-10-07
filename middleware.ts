// ═══════════════════════════════════════════════════════════════════════
//  MIDDLEWARE — server-side routing protection for ALL test content
//
//  Covers (requirement #14 — direct URL protection):
//    • /listening/*.html, /reading/*.html  → static premium HTML gate
//      (this is what the runner iframe loads, AND what a user gets by
//      opening a direct file URL). Premium files are never served to
//      users without an active subscription — 403 with a branded page.
//    • /listening/[slug], /reading/[slug]  → runner pages
//      (unauthenticated → signin redirect; premium without active sub →
//      /subscription-required page)
//
//  The subscription claim comes from the ECDSA-signed session cookie —
//  clients cannot tamper with it (see lib/session.ts).
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken, deriveAccessState } from '@/lib/session';
import { isFreeTest } from '@/lib/test-access';

/** `Authentic Listening Mock (1).html` → `authentic-listening-mock-1` */
function fileToSlug(pathname: string): string | null {
  const raw = pathname.split('/').pop() || '';
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  if (!decoded.toLowerCase().endsWith('.html')) return null;
  const base = decoded.slice(0, -'.html'.length);
  return base.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
}

function premiumDeniedHtml(): string {
  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>403 — Premium Test | StartIELTS</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center;
         font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         background: #f8fafc; color: #0f172a; padding: 16px; }
  .card { max-width: 380px; width: 100%; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 20px; padding: 32px 24px; text-align: center; box-shadow: 0 8px 30px rgba(15,23,42,.06); }
  .icon { width: 56px; height: 56px; border-radius: 16px; background: #ede9fe; display: flex;
          align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 13px; color: #64748b; line-height: 1.55; margin-bottom: 20px; }
  .btn { display: inline-block; width: 100%; padding: 12px 16px; border-radius: 12px;
         background: #7c3aed; color: #fff; font-weight: 700; font-size: 14px;
         text-decoration: none; }
  .btn.secondary { margin-top: 8px; background: #f1f5f9; color: #334155; font-weight: 600; }
  .code { margin-top: 16px; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>Premium Test</h1>
    <p>Ushbu test StartIELTS obunasi bilan ochiladi. To‘liq testlar kutubxonasiga kirish uchun obunani faollashtiring.</p>
    <a class="btn" href="/pricing">Obunani ko‘rish</a>
    <a class="btn secondary" href="/dashboard">Dashboardga qaytish</a>
    <div class="code">403 · Access requires an active StartIELTS subscription</div>
  </div>
</body>
</html>`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard test content under /listening and /reading.
  if (!pathname.startsWith('/listening') && !pathname.startsWith('/reading')) {
    return NextResponse.next();
  }

  // List pages (/listening, /reading, and trailing slash) stay public.
  if (pathname === '/listening' || pathname === '/reading') {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  const state = deriveAccessState(payload);

  // ── Static test HTML (iframe content + direct file URL) ──
  if (pathname.toLowerCase().endsWith('.html')) {
    const slug = fileToSlug(pathname);
    if (slug && isFreeTest(slug)) return NextResponse.next(); // free teaser tests
    if (state.authenticated && state.subscriptionActive) return NextResponse.next();
    return new NextResponse(premiumDeniedHtml(), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // ── Other static assets (audio etc.) — pass through ──
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // ── Runner page /listening/[slug] or /reading/[slug] ──
  const segments = pathname.split('/').filter(Boolean); // ['listening', slug]
  const slug = (() => {
    try {
      return decodeURIComponent(segments[1] || '');
    } catch {
      return segments[1] || '';
    }
  })();

  // Unknown deep path — let the 404 page handle it.
  if (!slug) return NextResponse.next();

  if (isFreeTest(slug)) {
    if (state.authenticated) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/signin';
    url.search = '';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Premium test page
  if (state.authenticated && state.subscriptionActive) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/subscription-required';
  url.search = '';
  url.searchParams.set('skill', segments[0]);
  url.searchParams.set('slug', slug);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/listening/:path*', '/reading/:path*'],
};

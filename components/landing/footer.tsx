import Link from 'next/link';

const links = {
  platform: [
    { label: 'Features', href: '#skills' },
    { label: 'Practice', href: '/practice' },
    { label: 'Mock Exams', href: '/mock-exam' },
    { label: 'Pricing', href: '#pricing' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#080808]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Logo */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-white">StartIELTS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/30 leading-relaxed">
              The smart way to prepare for IELTS. Practice all four skills, take mock exams, and achieve your target band.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/20 mb-4">Platform</h4>
            <ul className="space-y-3">
              {links.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/20 mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 sm:flex-row">
          <p className="text-xs text-white/20">&copy; 2026 StartIELTS. All rights reserved.</p>
          <p className="text-xs text-white/15">Built for students, by educators.</p>
        </div>
      </div>
    </footer>
  );
}

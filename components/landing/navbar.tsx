'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Platform', href: '#skills' },
  { label: 'Practice', href: '#mock-exam' },
  { label: 'Mock Exams', href: '#mock-exam' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 transition-all group-hover:shadow-indigo-500/30 group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white">StartIELTS</span>
            </div>
          </Link>

          {/* Center Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-white/50 transition-colors hover:text-white/90"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-white/50 transition-colors hover:text-white/90"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-all hover:bg-white/90"
            >
              Start for Free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#080808]/98 backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-semibold text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <Link href="/signin" onClick={() => setMobileOpen(false)} className="text-lg text-white/50">
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-black"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

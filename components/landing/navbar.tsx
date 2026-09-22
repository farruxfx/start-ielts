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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-sm shadow-blue-500/20 transition-all group-hover:shadow-blue-500/30 group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 7C14 7 12 9 12 12C12 15 14 17 17 17C20 17 22 15 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[16px] font-bold tracking-tight text-slate-900">StartIELTS</span>
          </Link>

          {/* Center Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-2 text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-blue-500/30"
            >
              Start for Free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-slate-900 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white/98 backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <Link href="/signin" onClick={() => setMobileOpen(false)} className="text-lg text-slate-500">
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-blue-500 px-8 py-3 text-base font-semibold text-white shadow-sm"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

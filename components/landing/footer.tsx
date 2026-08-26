import Link from 'next/link';
import { GraduationCap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Mock Exams', href: '/practice' },
    { label: 'Analytics', href: '/dashboard' },
  ],
  Skills: [
    { label: 'Reading', href: '/practice?skill=reading' },
    { label: 'Listening', href: '/practice?skill=listening' },
    { label: 'Writing', href: '/practice?skill=writing' },
    { label: 'Speaking', href: '/practice?skill=speaking' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Study Guides', href: '/guides' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'AI Disclaimer', href: '/ai-disclaimer' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@ieltspro.app', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container-mw container-px py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 transition-all group-hover:shadow-blue-500/40 group-hover:scale-105">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">IELTS PRO</span>
                <span className="-mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Score Higher
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Professional IELTS preparation platform with AI-powered evaluation, real exam
              interface, and detailed analytics.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-blue-200 hover:text-foreground hover:shadow-sm dark:hover:border-blue-800"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Legal Note */}
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
              IELTS PRO is not affiliated with, endorsed by, or connected to the official IELTS
              organization, Cambridge University Press, or the British Council.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IELTS PRO. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Built for students, by educators.</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/sitemap.xml" className="hover:text-foreground">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

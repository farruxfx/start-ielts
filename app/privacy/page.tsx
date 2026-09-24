'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="mx-auto flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold">StartIELTS</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 30, 2026</p>

        <div className="prose prose-neutral dark:prose-invert mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly: account details (name, email), writing and speaking submissions,
              test results, payment information, and communication with us. We also collect usage data including
              device information, browser type, and interaction patterns within the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              Your information is used to: provide and improve the Service, process payments, deliver AI-powered
              evaluations, track your learning progress, send relevant notifications about your subscription and
              learning goals, and communicate important updates about the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. AI Processing</h2>
            <p className="text-muted-foreground">
              Writing and speaking submissions are processed by AI services (such as Groq) to provide evaluation
              feedback. Your submissions are sent to these services solely for evaluation purposes and are not
              stored by the AI provider beyond what is necessary for processing. We do not sell your submissions
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using industry-standard encryption and security practices. We use
              Supabase for database management with built-in row-level security. Payment information is processed
              through secure payment channels and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or share your personal information with third parties except: (a) with your
              explicit consent; (b) to comply with legal obligations; (c) with service providers who assist in
              operating the Service (under strict confidentiality agreements); (d) to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to: access your personal data, correct inaccurate data, delete your account
              and associated data, export your test results and progress data, and opt out of non-essential
              communications. To exercise these rights, contact us through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active or as needed to provide the Service.
              When you delete your account, we permanently remove your personal data within 30 days, except
              where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your session and preferences. We do not use tracking cookies
              or third-party advertising cookies. You can manage cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              StartIELTS is not intended for users under 13 years of age. We do not knowingly collect personal
              information from children. If we become aware that a child has provided us with personal information,
              we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              through the Service or via email. Your continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or your data, please contact us through the
              platform or our Telegram channel.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

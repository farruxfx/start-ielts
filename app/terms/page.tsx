'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <span className="font-bold">IELTS PRO</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 30, 2026</p>

        <div className="prose prose-neutral dark:prose-invert mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using IELTS PRO (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              IELTS PRO is an IELTS preparation platform that provides practice tests, mock exams, AI-powered writing
              and speaking evaluation, vocabulary tools, grammar exercises, and progress tracking. The Service is designed
              to help users prepare for the IELTS examination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You may create an account using your email address or Google account. You are responsible for maintaining
              the confidentiality of your account credentials. You agree to provide accurate information during registration
              and to keep your account information up to date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Subscriptions and Payments</h2>
            <p className="text-muted-foreground">
              IELTS PRO offers free and paid subscription plans. Paid subscriptions provide access to premium features
              including full mock exams, AI-powered evaluation, and advanced analytics. Payment is processed through
              verified payment methods. Subscriptions automatically expire at the end of the billing period unless renewed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. User Content</h2>
            <p className="text-muted-foreground">
              When you submit writing or speaking responses for AI evaluation, you retain ownership of your content.
              By submitting content, you grant IELTS PRO a limited license to process and evaluate your responses
              solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. AI-Generated Feedback</h2>
            <p className="text-muted-foreground">
              AI-powered writing and speaking evaluations are provided as study aids and should not be considered
              official IELTS scores. These evaluations use artificial intelligence and may contain inaccuracies.
              Always consult official IELTS resources for authoritative scoring criteria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Prohibited Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to: (a) share your account credentials with others; (b) attempt to circumvent access controls
              or payment requirements; (c) use the Service for any unlawful purpose; (d) distribute or reproduce IELTS PRO
              content without authorization; (e) introduce malware or harmful code.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, design, code, and trademarks associated with IELTS PRO are the property of IELTS PRO and
              are protected by applicable intellectual property laws. You may not reproduce, distribute, or create
              derivative works without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              IELTS PRO is provided &quot;as is&quot; without warranties of any kind. We are not responsible for any
              inaccuracies in AI-generated feedback, nor for any decisions made based on such feedback. Our total
              liability shall not exceed the amount paid by you for the Service in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes
              constitutes acceptance of the modified Terms. We will notify users of material changes via email
              or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us through the platform or via our Telegram channel.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

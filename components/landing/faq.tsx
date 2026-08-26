'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is IELTS PRO affiliated with the official IELTS organization?',
    answer:
      'No. IELTS PRO is an independent preparation platform. We are not affiliated with, endorsed by, or connected to the official IELTS organization, Cambridge University Press, or the British Council. Our practice materials are designed to help you prepare effectively.',
  },
  {
    question: 'How does the AI writing evaluation work?',
    answer:
      'Our AI evaluates your Writing Task 1 and Task 2 responses across all official IELTS criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. You receive a detailed breakdown with specific feedback on each criterion and suggestions for improvement.',
  },
  {
    question: 'Can I use IELTS PRO on my phone?',
    answer:
      'Yes! IELTS PRO is fully responsive and works on all devices — desktop, tablet, and mobile. You can practice anywhere, anytime. However, we recommend using a desktop or tablet for the best experience, especially for writing practice.',
  },
  {
    question: 'How is the speaking practice different from just recording myself?',
    answer:
      'Our speaking simulator provides AI-powered analysis of your pronunciation, fluency, vocabulary, and grammar. You get specific feedback on areas to improve, not just a recording. The AI also evaluates how well your response addresses the question.',
  },
  {
    question: 'Do I get a certificate after completing practice tests?',
    answer:
      'IELTS PRO provides detailed score reports showing your performance across all skills. However, these are practice scores and should not be confused with official IELTS results. They are excellent for tracking your progress and identifying areas to focus on.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Absolutely. You can cancel your subscription at any time from your account settings. There are no cancellation fees. If you cancel, you will continue to have access until the end of your current billing period.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="container-mw container-px">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Got questions? We have answers.
            </p>
          </div>

          {/* FAQ List */}
          <div className="mt-12 space-y-4 lg:mt-16">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card transition-all hover:border-purple-200 dark:hover:border-purple-800"
              >
                <button
                  className="flex w-full items-center justify-between p-5 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="pr-4 text-sm font-semibold sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Still have questions?{' '}
              <a
                href="mailto:hello@ieltspro.app"
                className="font-medium text-primary hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

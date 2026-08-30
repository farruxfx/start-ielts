'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is IELTS PRO free to use?',
    answer: 'Yes! IELTS PRO offers a free plan with limited access to practice tests, vocabulary, and basic analytics. You can upgrade to a paid plan for full access to all features.',
  },
  {
    question: 'How does AI writing evaluation work?',
    answer: 'Our AI writing evaluator uses Groq\'s Llama 3.3 70B model to analyze your essays. It provides band scores, identifies grammar mistakes, suggests vocabulary improvements, and gives detailed feedback on task achievement, coherence, and lexical resource.',
  },
  {
    question: 'Can I practice speaking with AI?',
    answer: 'Yes! IELTS PRO uses Web Speech API for speech recognition and Groq AI for evaluation. You can practice all 3 parts of the speaking test and get instant feedback on fluency, pronunciation, grammar, and vocabulary.',
  },
  {
    question: 'How many mock exams are available?',
    answer: 'We offer 50 full-length mock exams that simulate the real IELTS test experience. Each mock exam includes all 4 sections (Listening, Reading, Writing, Speaking) with timed interfaces and detailed scoring.',
  },
  {
    question: 'Can I use IELTS PRO on my phone?',
    answer: 'Absolutely! IELTS PRO is fully responsive and works great on all devices — smartphones, tablets, and desktops. We also support PWA for offline access.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept payments via HUMO card through our automated Telegram payment system. Simply transfer the exact amount to the provided card number, and your subscription will be activated automatically.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 7-day money-back guarantee on all paid plans. If you\'re not satisfied, contact our support team for a full refund.',
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b border-border last:border-0"
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary"
      >
        <span className="text-lg font-medium pr-4">{faq.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-40 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-mw container-px">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about IELTS PRO
          </p>
        </div>

        {/* FAQ List */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.question} faq={faq} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

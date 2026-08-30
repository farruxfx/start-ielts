'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Dilshod Karimov',
    role: 'Band 8.0 Achiever',
    content: 'IELTS PRO helped me go from 6.5 to 8.0 in just 3 months. The AI writing feedback is incredible!',
    rating: 5,
    avatar: 'DK',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Nilufar Rustamova',
    role: 'Band 7.5 Achiever',
    content: 'The speaking practice with real-time feedback changed everything. I finally feel confident speaking English.',
    rating: 5,
    avatar: 'NR',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Sardor Toshmatov',
    role: 'Band 7.0 Achiever',
    content: 'Best IELTS platform in Uzbekistan. The mock exams feel exactly like the real test.',
    rating: 5,
    avatar: 'ST',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Malika Nishonova',
    role: 'Band 8.5 Achiever',
    content: 'From 5.5 to 8.5 in 6 months! The personalized study plan kept me on track every day.',
    rating: 5,
    avatar: 'MN',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Jasur Alimov',
    role: 'Band 7.5 Achiever',
    content: 'The vocabulary spaced repetition system is genius. I remembered 500+ words effortlessly.',
    rating: 5,
    avatar: 'JA',
    color: 'from-rose-500 to-red-500',
  },
  {
    name: 'Gulnora Karimova',
    role: 'Band 7.0 Achiever',
    content: 'Finally got my visa! IELTS PRO made preparation fun and effective. Thank you!',
    rating: 5,
    avatar: 'GK',
    color: 'from-indigo-500 to-blue-500',
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Quote icon */}
      <Quote className="absolute right-4 top-4 h-8 w-8 text-muted-foreground/10" />

      {/* Stars */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Content */}
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} text-sm font-bold text-white`}>
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />

      <div className="container-mw container-px relative z-10">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600">
            Success Stories
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Students who <span className="text-amber-500">achieved</span> their dreams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who improved their IELTS scores with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">4.9/5</span> average rating
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">2,000+</span> happy students
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">95%</span> success rate
          </div>
        </div>
      </div>
    </section>
  );
}

import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Skills } from '@/components/landing/skills';
import { MockExamShowcase } from '@/components/landing/mock-exam-showcase';
import { Analytics } from '@/components/landing/analytics';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { websiteJsonLd, organizationJsonLd, courseJsonLd, jsonLdScript } from '@/lib/seo';

export default function Home() {
  return (
    <>
      {/* JSON-LD structured data (Phase 7.5) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(courseJsonLd()) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <MockExamShowcase />
        <Analytics />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

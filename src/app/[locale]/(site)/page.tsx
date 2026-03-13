import BenefitsGrid from '@/components/sections/benefits-grid';
import FaqAccordion from '@/components/sections/faq-accordion';
import HeroSection from '@/components/sections/hero-section';
import { CoreFeatures } from '@/components/sections/core-features';
import PricingSection from '@/components/sections/pricing';

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <CoreFeatures />
      <BenefitsGrid />
      <PricingSection />
      <FaqAccordion />
    </main>
  );
}

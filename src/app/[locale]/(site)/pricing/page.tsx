import FaqAccordion from '@/components/sections/faq-accordion';
import type { Metadata } from 'next';
import PricingSection from '@/components/sections/pricing';

export const metadata: Metadata = {
  title: 'Pricing',
};

export default async function PricingPage() {
  return (
    <>
      <PricingSection />
      <FaqAccordion />
    </>
  );
}

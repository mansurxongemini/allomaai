'use client';

import { useState } from 'react';
import {
  getBillingPeriods,
  getBillingPlans,
} from '@/components/sections/pricing/data';
import { cn } from '@/lib/utils';
import { PricingCard } from '@/components/sections/pricing/card';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';


export default function PricingSection() {
  const [activeBillingPeriodKey, setActiveBillingPeriodKey] = useState<'monthly' | 'yearly'>('monthly');

  const t = useTranslations('Pricing');

  const BILLING_PERIODS = getBillingPeriods(t);
  const BILLING_PLANS = getBillingPlans(t);

  return (
    <section className="py-14 md:py-30 bg-gray-50 dark:bg-[#171f2e] dark:bg-linear-180 dark:from-white/3 dark:from-[45.56%] dark:to-white/0">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl dark:text-white/90 md:text-title-lg">
            {t('title')}
          </h2>
          <p className="max-w-xl mx-auto leading-6 text-gray-500 dark:text-gray-400">
            {t('subtext')}
          </p>
        </div>

        <div>
          {/* Billing Toggle */}
          <div className="flex justify-center relative z-30 mt-12">
            <div className="relative flex p-1 bg-white dark:bg-[#1D2939] rounded-full shadow-theme-xs">
              {BILLING_PERIODS.map((period) => (
                <Button
                  key={period.key}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveBillingPeriodKey(period.key)}
                  className={cn(
                    'relative flex items-center gap-2 px-6 py-2 rounded-full text-gray-700 dark:text-gray-400 hover:bg-accent/10',
                    {
                      'bg-gray-800 dark:bg-white/[0.05] text-white dark:text-white':
                        period.key === activeBillingPeriodKey,
                      'pr-2': period.saving,
                    }
                  )}
                >
                  {period.label}

                  {period.saving && (
                    <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      {period.saving}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-12 z-30 relative space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-5xl lg:mx-auto lg:grid-cols-3 xl:gap-8">
            {BILLING_PLANS.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                billingPeriod={activeBillingPeriodKey}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

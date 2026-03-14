// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBillingPeriods = (t: any) => [
  {
    label: t('monthly'),
    key: 'monthly',
    saving: null,
  },
  {
    label: t('annually'),
    key: 'yearly',
    saving: t('save'),
  },
] as const;

const AMOUNTS = {
  free: {
    monthly: 0,
    yearly: 0,
  },
  plus: {
    monthly: 15,
    yearly: 144,
  },
  pro: {
    monthly: 40,
    yearly: 384,
  },
  ultra: {  // <-- SHU QISMNI QO'SHING (Narxlarni o'zingizga moslab o'zgartirishingiz mumkin)
    monthly: 90, 
    yearly: 864,
  },
  enterprise: {
    monthly: null,
    yearly: null,
  },
};

export type TBILLING_PLAN = ReturnType<typeof getBillingPlans>[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBillingPlans = (t: any) => [
  {
    name: t('free_title'),
    description: t('free_desc'),
    pricing: {
      monthly: {
        amount: AMOUNTS['free']['monthly'],
        formattedPrice: '$' + AMOUNTS['free']['monthly'],
        stripeId: null,
      },
      yearly: {
        amount: AMOUNTS['free']['yearly'],
        formattedPrice: '$' + AMOUNTS['free']['yearly'],
        stripeId: null,
      },
    },
    features: [
      t('features.basic_ai'),
      t('features.mind_maps'),
    ],
    cta: t('free_cta'),
    popular: false,
  },
  {
    name: t('pro_title'),
    description: t('pro_desc'),
    pricing: {
      monthly: {
        amount: AMOUNTS['pro']['monthly'],
        formattedPrice: '$' + AMOUNTS['pro']['monthly'],
        stripeId: process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID!,
      },
      yearly: {
        amount: AMOUNTS['pro']['yearly'],
        formattedPrice: '$' + AMOUNTS['pro']['yearly'],
        stripeId: process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE_ID!,
      },
    },
    features: [
      t('features.advanced_ai'),
      t('features.mind_maps'),
      t('features.essays'),
      t('features.repetition'),
      t('features.support')
    ],
    cta: t('pro_cta'),
    popular: true,
  },
  {
    name: t('ultra_title'),
    description: t('ultra_desc'),
    pricing: {
      monthly: {
        amount: AMOUNTS['ultra']['monthly'],
        formattedPrice: '$' + AMOUNTS['ultra']['monthly'],
        stripeId: process.env.NEXT_PUBLIC_ULTRA_MONTHLY_PRICE_ID || null,
      },
      yearly: {
        amount: AMOUNTS['ultra']['yearly'],
        formattedPrice: '$' + AMOUNTS['ultra']['yearly'],
        stripeId: process.env.NEXT_PUBLIC_ULTRA_YEARLY_PRICE_ID || null,
      },
    },
    features: [
      t('features.advanced_ai'),
      t('features.mind_maps'),
      t('features.essays'),
      t('features.repetition'),
      t('features.support'),
      t('features.case_generator') // Ultra uchun qo'shimcha afzallik
    ],
    cta: t('ultra_cta'),
    popular: false,
  }
  
];

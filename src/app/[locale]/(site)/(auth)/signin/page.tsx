'use client';

import { Link } from '@/i18n/routing';
import { SignInWithGoogle } from '../_components/social-auth';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const t = useTranslations('Auth');

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="wrapper">
        <div className="relative max-w-[600px] mx-auto">
          <div className="contact-wrapper border p-8 sm:p-14 relative z-30 bg-white dark:bg-dark-primary dark:border-dark-primary border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-gray-800 dark:text-white/90 font-bold text-3xl mb-2">
                {t('welcome_in')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('sub_in')}
              </p>
            </div>
            <div className="flex justify-center">
              <SignInWithGoogle />
            </div>

            <div className="mt-5">
              <p className="text-gray-700 dark:text-gray-400 text-sm">
                {t('no_account')}{' '}
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-primary-500"
                >
                  {t('btn_up')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0">
        <svg
          width="930"
          height="760"
          viewBox="0 0 930 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.3" filter="url(#filter0_f_9248_10254)">
            <circle cx="380.335" cy="380.335" r="179.665" fill="#FF58D5" />
          </g>
          <g opacity="0.7" filter="url(#filter1_f_9248_10254)">
            <circle cx="549.665" cy="380.335" r="179.665" fill="#4E6EFF" />
          </g>
          <defs>
            <filter
              id="filter0_f_9248_10254"
              x="0.669922"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_9248_10254"
              />
            </filter>
            <filter
              id="filter1_f_9248_10254"
              x="170"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_9248_10254"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </section>
  );
}

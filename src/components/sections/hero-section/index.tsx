import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Subheading } from './subheading';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
        <div>
          <div className="max-w-[800px] mx-auto">
            <div className="text-center pb-16 md:pb-20">
              <Subheading text={t('badge')} />

              <h1 className="mx-auto mb-6 max-w-[700px] text-5xl md:text-6xl font-bold leading-tight text-foreground">
                {t('headline')}
              </h1>
              <p className="mx-auto max-w-[620px] text-center text-lg md:text-xl leading-relaxed text-muted-foreground">
                {t('subheadline')}
              </p>

              <div className="relative z-30 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-[var(--radius-md)] bg-primary px-7 text-sm font-semibold text-white hover:bg-primary-hover">
                  <Link href="/signup">{t('cta_free')}</Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="h-12 rounded-[var(--radius-md)] border-border bg-surface px-7 text-sm font-semibold text-foreground hover:bg-accent/10">
                  <Link href="/signin">{t('cta_login')}</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="max-w-[1000px] mx-auto relative">
            <div className="p-3 sm:p-[18px] relative z-30 rounded-[32px] border border-white/30 dark:border-white/10 bg-white/20">
              <Image
                src="/images/hero/hero-img.jpg"
                alt="Alloma AI platformasining asosiy boshqaruv paneli va o'quv jarayoni ko'rinishi"
                className="w-full rounded-2xl block dark:hidden"
                width={966}
                height={552}
                priority
              />
              <Image
                src="/images/hero/hero-img-dark.png"
                alt="Alloma AI platformasining tungi rejimdagi boshqaruv paneli ko'rinishi"
                className="w-full rounded-2xl hidden dark:block"
                width={966}
                height={552}
                priority
              />
            </div>
            <div className="absolute hidden lg:block z-10 -top-20 -translate-y-20 left-1/2 -translate-x-1/2">
              <svg
                width="1300"
                height="1001"
                viewBox="0 0 1300 1001"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.7" filter="url(#filter0_f_9279_7148)">
                  <circle cx="800" cy="500.03" r="300" fill="#4E6EFF" />
                </g>
                <g opacity="0.3" filter="url(#filter1_f_9279_7148)">
                  <circle cx="500" cy="500.03" r="300" fill="#FF58D5" />
                </g>
                <defs>
                  <filter
                    id="filter0_f_9279_7148"
                    x="300"
                    y="0.029541"
                    width="1000"
                    height="1000"
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
                      result="effect1_foregroundBlur_9279_7148"
                    />
                  </filter>
                  <filter
                    id="filter1_f_9279_7148"
                    x="0"
                    y="0.029541"
                    width="1000"
                    height="1000"
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
                      result="effect1_foregroundBlur_9279_7148"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-glow-bg pointer-events-none w-full h-167.5 absolute z-10 bottom-0"></div>
    </section>
  );
}

import { getCurrentYear } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="relative overflow-hidden bg-gray-900">
      <span className="absolute top-0 -translate-x-1/2 left-1/2">
        <svg
          width="1260"
          height="457"
          viewBox="0 0 1260 457"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_11105_867)">
            <circle cx="630" cy="-173.299" r="230" fill="#3B2EFF" />
          </g>
          <defs>
            <filter
              id="filter0_f_11105_867"
              x="0"
              y="-803.299"
              width="1260"
              height="1260"
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
                stdDeviation="200"
                result="effect1_foregroundBlur_11105_867"
              />
            </filter>
          </defs>
        </svg>
      </span>
      <div className="relative z-10 py-16 xl:py-24">
        <div className="container px-5 mx-auto sm:px-7">
          <div className="flex flex-col items-center text-center gap-6">
            <Link href="/" className="block">
              <span className="text-2xl font-bold text-white tracking-tight">
                ALLOMA AI
              </span>
            </Link>
            <p className="block text-sm text-gray-400 max-w-md">
              {t('description')}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm font-normal text-gray-400 transition hover:text-white"
              >
                {t('terms')}
              </Link>
              <Link
                href="/privacy"
                className="text-sm font-normal text-gray-400 transition hover:text-white"
              >
                {t('privacy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="container relative z-10 px-5 mx-auto sm:px-7">
          <div className="py-5 text-center">
            <p className="text-sm text-gray-500">
              &copy; {getCurrentYear()} ALLOMA AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

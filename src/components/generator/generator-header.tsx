import { CloseIcon, MenuIcon } from '@/icons/icons';
import Image from 'next/image';
import Link from 'next/link';
import DesktopNav from '../layout/header/desktop-nav';
import ThemeToggle from '../layout/header/theme-toggle';

export default function GeneratorHeader({
  toggleSidebar,
  toggleRightSidebar,
  sidebarOpen,
}: {
  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
  sidebarOpen: boolean;
}) {
  return (
    <header className="bg-white dark:bg-dark-primary border-b dark:border-gray-800 border-gray-100 sticky top-0 z-50 py-2 lg:py-4">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* <!-- Mobile menu button --> */}
              <button
                aria-label="Toggle left sidebar"
                onClick={toggleSidebar}
                className="rounded-md text-gray-400 lg:hidden"
              >
                {sidebarOpen ? (
                  <CloseIcon className="size-6" />
                ) : (
                  <MenuIcon className="size-6" />
                )}
              </button>

              <div className="flex items-center">
                <Link href="/">
                  <Image
                    src="/images/logo-black.svg"
                    className="block dark:hidden"
                    width={180}
                    height={30}
                    alt="ALLOMA AI Logo"
                  />
                  <Image
                    src="/images/logo-white.svg"
                    className="hidden dark:block"
                    width={180}
                    height={30}
                    alt="ALLOMA AI Logo"
                  />
                </Link>
              </div>
            </div>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-3 justify-self-end">
            <ThemeToggle />

            <button
              onClick={toggleRightSidebar}
              type="button"
              className="inline-flex xl:hidden items-center dark:hover:bg-white/5 dark:hover:text-white/90 hover:bg-gray-100 hover:text-gray-800 text-gray-500 dark:text-gray-400 justify-center border border-gray-200 dark:border-gray-700 rounded-full size-11"
            >
              <span className="sr-only">Open right sidebar</span>
              <svg
                className="size-7"
                width="32"
                height="32"
                viewBox="0 0 25 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                transform="rotate(0 0 0)"
              >
                <path
                  d="M6.3125 13.7558C5.346 13.7559 4.5625 12.9723 4.5625 12.0059V11.9959C4.5625 11.0294 5.346 10.2458 6.3125 10.2458C7.279 10.2458 8.0625 11.0294 8.0625 11.9958V12.0058C8.0625 12.9723 7.279 13.7558 6.3125 13.7558Z"
                  fill="currentColor"
                />
                <path
                  d="M18.3125 13.7558C17.346 13.7558 16.5625 12.9723 16.5625 12.0058V11.9958C16.5625 11.0294 17.346 10.2458 18.3125 10.2458C19.279 10.2458 20.0625 11.0294 20.0625 11.9958V12.0058C20.0625 12.9723 19.279 13.7558 18.3125 13.7558Z"
                  fill="currentColor"
                />
                <path
                  d="M10.5625 12.0058C10.5625 12.9723 11.346 13.7558 12.3125 13.7558C13.279 13.7558 14.0625 12.9723 14.0625 12.0058V11.9958C14.0625 11.0294 13.279 10.2458 12.3125 10.2458C11.346 10.2458 10.5625 11.0294 10.5625 11.9958V12.0058Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

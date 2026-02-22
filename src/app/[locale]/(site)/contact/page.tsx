import { Input } from '@/components/ui/inputs';
import { Label } from '@/components/ui/label-custom';
import { Textarea } from '@/components/ui/inputs/textarea';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <section className="py-28 relative">
      <div className="wrapper">
        <div className="relative max-w-[800px] mx-auto">
          <div className="contact-wrapper border p-14 relative z-30 bg-white border-gray-100 dark:bg-dark-primary dark:border-gray-800">
            <div className="text-center mb-12">
              <h3 className="text-gray-800 font-bold dark:text-white text-3xl mb-2">
                Need any Help? Get in touch 👋
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Open a ticket, we will get back to you ASAP
              </p>
            </div>
            <form>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input type="text" placeholder="Jhamse" />
                </div>
                <div>
                  <Label htmlFor="lastName"> Last Name</Label>
                  <Input type="text" placeholder="Enter your last name" />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="email">Email address</Label>
                  <Input type="text" placeholder="example@gmail.com" />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="message">Message</Label>
                  <Textarea rows={6} placeholder="Type your message" />
                </div>
                <div className="col-span-full">
                  <button className="bg-primary-500 hover:bg-primary-600 transition h-12 py-3 px-6 w-full font-medium text-white text-sm rounded-full">
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0">
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
      </span>
    </section>
  );
}

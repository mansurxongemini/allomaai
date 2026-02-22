type IconProps = React.SVGProps<SVGSVGElement>;

export default function GlowGradient(props: IconProps) {
  return (
    <svg
      width={800}
      height={459}
      viewBox="0 0 1099 960"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.2" filter="url(#filter0_f_9282_10364)">
        <circle cx="479.835" cy="480.254" r="179.665" fill="#FF58D5" />
      </g>
      <g opacity="0.1" filter="url(#filter1_f_9282_10364)">
        <circle cx="619.165" cy="480.254" r="179.665" fill="#4E6EFF" />
      </g>
      <defs>
        <filter
          id="filter0_f_9282_10364"
          x="0.169678"
          y="0.589355"
          width="959.33"
          height="959.33"
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
            stdDeviation="150"
            result="effect1_foregroundBlur_9282_10364"
          />
        </filter>
        <filter
          id="filter1_f_9282_10364"
          x="139.5"
          y="0.589355"
          width="959.33"
          height="959.33"
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
            stdDeviation="150"
            result="effect1_foregroundBlur_9282_10364"
          />
        </filter>
      </defs>
    </svg>
  );
}

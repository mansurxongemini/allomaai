import * as icons from "@/assets/homepage/core-features";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCoreFeatures = (t: any) => [
  {
    title: t('f1_title'),
    description: t('f1_desc'),
    iconUrl: icons.bulb,
  },
  {
    title: t('f2_title'),
    description: t('f2_desc'),
    iconUrl: icons.pencil,
  },
  {
    title: t('f3_title'),
    description: t('f3_desc'),
    iconUrl: icons.robot,
  },
];

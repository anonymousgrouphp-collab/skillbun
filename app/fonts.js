import { Cinzel, Pixelify_Sans } from 'next/font/google';

export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-pixelify',
  display: 'swap',
});

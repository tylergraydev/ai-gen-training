import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const siteBasePath = process.env.PAGES_BASE_PATH ?? '';
const socialImage = `${siteOrigin}${siteBasePath}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(`${siteOrigin}${siteBasePath}/`),
  title: 'AI Image Lab — From Pixels to Diffusion',
  description: 'An interactive course for understanding color, image tensors, noise, and AI image generation.',
  openGraph: {
    title: 'AI Image Lab — From Pixels to Diffusion',
    description: 'See and manipulate the numbers behind color, image tensors, and noise.',
    images: [{ url: socialImage, width: 1792, height: 1024, alt: 'AI Image Lab — From pixels to diffusion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Lab — From Pixels to Diffusion',
    description: 'See and manipulate the numbers behind color, image tensors, and noise.',
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}

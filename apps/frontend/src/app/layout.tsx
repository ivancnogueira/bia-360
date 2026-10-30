import type { Metadata, Viewport } from 'next';
import './globals.css';
import './hero-copy.css';
import './navigation.css';
import './sales.css';
import { asset } from '../data/product';
import { siteConfig, allKeywordsString } from '../data/seo';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: '%s | BIA 360',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  generator: 'Next.js',
  keywords: allKeywordsString.split(', '),
  referrer: 'origin-when-cross-origin',
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: 'images/bia.png',
        width: 1200,
        height: 630,
        alt: 'BIA 360 Assistente Virtual e Plataforma com Inteligencia Artificial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['images/bia.png'],
    creator: '@baroneacademy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: asset('/images/favicon.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('/images/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { url: asset('/images/icon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    shortcut: asset('/favicon.ico'),
    apple: [
      { url: asset('/images/apple-icon.png'), sizes: '512x512', type: 'image/png' },
    ],
  },
  other: {
    'geo.region': siteConfig.geo.region,
    'geo.placename': siteConfig.geo.placename,
    'geo.position': `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
    ICBM: `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{`
          @font-face {
            font-family: Manrope;
            src: url('${asset('/fonts/manrope-500.ttf')}') format('truetype');
            font-weight: 400 600;
            font-display: swap;
          }
          @font-face {
            font-family: Manrope;
            src: url('${asset('/fonts/manrope.ttf')}') format('truetype');
            font-weight: 700 900;
            font-display: swap;
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

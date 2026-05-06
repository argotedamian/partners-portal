import Script from 'next/script';
import { Suspense } from 'react';
import { HomeClient } from './HomeClient';

export const metadata = {
  title: 'Cotizá una garantía',
  description: 'Cotizá una garantía Hoggax en minutos. Portal de partners para generar cotizaciones rápidas y seguras.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cotizá una garantía | Hoggax Partners',
    description: 'Cotizá una garantía Hoggax en minutos. Portal de partners.',
    url: 'https://partners.hoggax.com/',
  },
};

export default function Home() {
  return (
    <>
      <Script
        id="ld-json-org"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: 'Hoggax',
                url: 'https://partners.hoggax.com/',
                logo: 'https://partners.hoggax.com/hoggax-logo.svg',
              },
              {
                '@type': 'WebSite',
                name: 'Hoggax Partners',
                url: 'https://partners.hoggax.com/',
                inLanguage: 'es-AR',
              },
            ],
          }),
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[var(--app-lilac)]" />}>
        <HomeClient />
      </Suspense>
    </>
  );
}
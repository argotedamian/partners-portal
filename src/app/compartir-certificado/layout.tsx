import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compartir certificado',
  description: 'Compartí el certificado de Hoggax de forma segura.',
  alternates: {
    canonical: '/compartir-certificado',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CompartirCertificadoLayout({ children }: { children: React.ReactNode }) {
  return children;
}


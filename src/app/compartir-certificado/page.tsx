'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShareCertificatePanel } from '@/components/partners-result/share-certificate-panel';

function sanitizeCertificateUrl(raw: string | null): string | null {
  if (raw == null || raw === '') return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const t = decoded.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch {
    return null;
  }
  return null;
}

function CompartirCertificadoInner() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('url');
  const safeUrl = sanitizeCertificateUrl(rawUrl);

  if (!safeUrl) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-[15px] font-semibold text-label">No pudimos cargar el enlace para compartir.</p>
        <p className="mt-2 text-[13px] text-label/60">Cerrá esta ventana e intentá de nuevo desde el resultado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px] px-4 py-8">
      <h1 className="mb-4 text-center text-[18px] font-extrabold text-label">Compartir certificado</h1>
      <ShareCertificatePanel qrValue={safeUrl} />
    </div>
  );
}

export default function CompartirCertificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center px-4 py-10 text-[14px] text-label/70">
          Cargando…
        </div>
      }
    >
      <CompartirCertificadoInner />
    </Suspense>
  );
}

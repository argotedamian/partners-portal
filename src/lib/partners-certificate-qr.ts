import type { Qualification } from '@/lib/quotation.api';

/** Misma base que `web` `result.component.ts` (Constancias en S3). */
const DEFAULT_CERTIFICATE_BASE_URL =
  'https://hoggax500.s3.us-east-1.amazonaws.com/Constancias_Aprobacion/';

function certificateBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CERTIFICATE_BASE_URL;
  const base = (fromEnv ?? DEFAULT_CERTIFICATE_BASE_URL).trim();
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * URL del PDF para codificar en el QR, alineada a web Result:
 * `{base}Constancia_{bail_number}.pdf`.
 */
export function buildPartnersCertificateQrValue(qualification: Qualification): string {
  const bail =
    qualification.bail_number != null && String(qualification.bail_number).trim() !== ''
      ? String(qualification.bail_number).trim()
      : null;

  if (!bail) {
    return 'https://www.hoggax.com';
  }

  const base = certificateBaseUrl();
  return `${base}Constancia_${encodeURIComponent(bail)}.pdf`;
}

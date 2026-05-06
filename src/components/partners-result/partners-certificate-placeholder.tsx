'use client';

import QRCode from 'react-qr-code';

type PartnersCertificatePlaceholderProps = {
  /** URL o texto a codificar en el QR (típicamente link público al certificado). */
  qrValue: string;
};

export function PartnersCertificatePlaceholder({ qrValue }: PartnersCertificatePlaceholderProps) {
  const value = qrValue.trim() || 'https://www.hoggax.com';

  return (
    <section className="partners-result-certificate bg-white py-8 sm:py-10" aria-label="Certificado">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="partners-result-certificate-title text-center text-[18px] font-extrabold text-label">
          Descargá el certificado de aprobación
        </h3>

        <div className="partners-result-qr-card mx-auto mt-5 grid max-w-[380px] place-items-center gap-4 rounded-2xl border border-[rgba(15,0,84,0.08)] bg-[rgba(239,240,255,0.7)] p-5">
          <div
            className="partners-result-qr flex h-[170px] w-[170px] items-center justify-center rounded-lg bg-white p-2 shadow-[inset_0_0_0_1px_rgba(15,0,84,0.06)]"
            role="img"
            aria-label="Código QR para acceder al certificado de aprobación"
          >
            <QRCode value={value} size={154} level="M" className="max-h-full max-w-full" />
          </div>
          <div className="partners-result-qr-actions grid w-full gap-3">
            <button
              type="button"
              className="partners-result-qr-download w-full rounded-lg bg-[#55c4a9] px-4 py-2 text-[15px] font-extrabold text-white"
              disabled
            >
              Descargar
            </button>
            <button
              type="button"
              className="partners-result-qr-share w-full rounded-lg border border-[rgba(15,0,84,0.12)] bg-white px-4 py-2 text-[15px] font-extrabold text-label/85"
              disabled
            >
              Compartir
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

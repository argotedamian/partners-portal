'use client';

import QRCode from 'react-qr-code';
import { toast } from 'sonner';

type PartnersCertificatePlaceholderProps = {
  /** URL o texto a codificar en el QR (típicamente link público al certificado). */
  qrValue: string;
};

export function PartnersCertificatePlaceholder({ qrValue }: PartnersCertificatePlaceholderProps) {
  const value = qrValue.trim() || 'https://www.hoggax.com';

  function openShareWindow() {
    const path = `/compartir-certificado?url=${encodeURIComponent(value)}`;
    const w = window.open(
      path,
      'partnersShareCertificate',
      'popup=yes,width=520,height=680,left=120,top=80,scrollbars=yes,resizable=yes',
    );
    if (w == null) {
      toast.error('Permití ventanas emergentes para compartir.');
    }
  }

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
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="partners-result-qr-download inline-flex w-full items-center justify-center rounded-lg bg-[#55c4a9] px-4 py-2 text-[15px] font-extrabold text-white no-underline"
            >
              Descargar
            </a>
            <button
              type="button"
              className="cursor-pointer partners-result-qr-share inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25C196] px-4 py-2 text-[15px] font-extrabold text-[#0F0054]"
              onClick={openShareWindow}
            >
              <svg
                width="23"
                height="18"
                viewBox="0 0 23 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M15 17.5L13.25 15.7188L17.7188 11.25H5.625C4.0625 11.25 2.73438 10.7031 1.64062 9.60938C0.546875 8.51562 0 7.1875 0 5.625C0 4.0625 0.546875 2.73438 1.64062 1.64062C2.73438 0.546875 4.0625 0 5.625 0H6.25V2.5H5.625C4.75 2.5 4.01042 2.80208 3.40625 3.40625C2.80208 4.01042 2.5 4.75 2.5 5.625C2.5 6.5 2.80208 7.23958 3.40625 7.84375C4.01042 8.44792 4.75 8.75 5.625 8.75H17.7188L13.25 4.25L15 2.5L22.5 10L15 17.5Z"
                  fill="#0F0054"
                />
              </svg>
              Compartir
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

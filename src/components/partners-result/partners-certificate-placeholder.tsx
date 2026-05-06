'use client';

export function PartnersCertificatePlaceholder() {
  return (
    <section className="partners-result-certificate bg-white py-8 sm:py-10" aria-label="Certificado">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="partners-result-certificate-title text-center text-[18px] font-extrabold text-label">
          Descargá el certificado de aprobación
        </h3>

        <div className="partners-result-qr-card mx-auto mt-5 grid max-w-[380px] place-items-center gap-4 rounded-2xl border border-[rgba(15,0,84,0.08)] bg-[rgba(239,240,255,0.7)] p-5">
          <div
            className="partners-result-qr h-[170px] w-[170px] rounded-lg bg-[repeating-linear-gradient(45deg,rgba(15,0,84,0.1),rgba(15,0,84,0.1)_8px,rgba(15,0,84,0.05)_8px,rgba(15,0,84,0.05)_16px)]"
            aria-hidden="true"
          />
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

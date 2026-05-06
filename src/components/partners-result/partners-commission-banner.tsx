'use client';

import { formatArs } from '@/lib/format-currency';
import { computePartnerCommissionInMoney } from '@/lib/partner-commission';

type PartnersCommissionBannerProps = {
  /** Importe final con IVA (mismo criterio que "Precio final" de la cotización). */
  importeConIva: number | null;
  commissionPercent: number | null;
};

export function PartnersCommissionBanner({ importeConIva, commissionPercent }: PartnersCommissionBannerProps) {
  const comisionMonto = computePartnerCommissionInMoney(importeConIva, commissionPercent);

  return (
    <section className="partners-result-band relative bg-gradient-to-r from-[#0c0b4d] to-[#15156a] py-8 mt-10" aria-label="Comisión">
      <div className="absolute left-1/2 top-0 z-[3] -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M7 14l5 5 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="partners-result-band-inner flex min-h-[176px] flex-col items-center justify-center gap-3 text-center">
          <h2 className="partners-result-band-text m-0 flex flex-col items-center gap-1 pt-5 text-center sm:gap-2">
            <span className="text-[clamp(1.125rem,3.2vw,1.75rem)] font-semibold leading-snug text-white/90">
              Tu comisión es de
            </span>
            <span className="block text-[clamp(1.75rem,8vw,3.75rem)] font-black leading-[1.05] tracking-tight !text-white [font-variant-numeric:tabular-nums]">
              {comisionMonto != null ? formatArs(comisionMonto) : '—'}
            </span>
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/money.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-95 sm:h-20 sm:w-20" />
        </div>
      </div>
    </section>
  );
}

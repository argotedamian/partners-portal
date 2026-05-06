'use client';

import type { Qualification, QualificationPaymentMethod } from '@/lib/quotation.api';
import { formatArs } from '@/lib/format-currency';
import { QuotationEditPanel } from '@/components/quotation-edit-panel';
import { QuoterPlanCard } from '@/components/quoter-plan-card';
import { PartnersCommissionBanner } from '@/components/partners-result/partners-commission-banner';
import { PartnersCertificatePlaceholder } from '@/components/partners-result/partners-certificate-placeholder';

type PartnersQuotationApprovedProps = {
  qualification: Qualification;
  paymentMethods: QualificationPaymentMethod[];
  commissionPercent: number | null;
};

export function PartnersQuotationApproved({
  qualification,
  paymentMethods,
  commissionPercent,
}: PartnersQuotationApprovedProps) {
  const cot = qualification?.api_res_data?.cotizacion;
  const alquiler = cot?.alquiler ?? null;
  const expensas = cot?.expensas ?? null;
  const duracionAnios = cot?.plazo ?? 2;
  const priceFinal = cot?.costoServicio;

  return (
    <div className="partners-result-approved overflow-x-hidden">
      <section className="partners-result-top py-5 sm:py-7">
        <div className="max-w-6xl mx-auto px-4">
          <div className="partners-result-editbar">
            <QuotationEditPanel />
          </div>

          <div className="partners-result-hero text-center pt-3">
            <h2 className="partners-result-title text-[var(--app-green)] font-extrabold text-[32px] leading-[1.05] sm:text-[44px]">
              Tu garantía Hoggax está aprobada.
            </h2>
            <p className="partners-result-subtitle font-bold text-label mt-3 text-[18px] sm:text-[22px]">
              Conocé las opciones de pago
            </p>

            <div className="partners-result-price mt-4 sm:mt-5 flex flex-col items-center gap-1">
              <span className="partners-result-price-label text-[12px] font-extrabold text-label/60">
                Precio final
              </span>
              <div className="partners-result-price-pill min-w-[170px] rounded-lg bg-[#1b1b44] px-4 py-2 text-[22px] font-extrabold text-white">
                {formatArs(priceFinal)}
              </div>
            </div>

            {paymentMethods.length > 0 && (
              <div className="mt-5" aria-label="Opciones de pago">
                <div className="partners-result-cards mx-auto grid w-full max-w-[1100px] grid-cols-1 justify-center gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-[300px_230px_230px_230px] xl:gap-4">
                  {paymentMethods.slice(0, 4).map((method) => (
                    <QuoterPlanCard
                      key={method._id}
                      plan={method}
                      offPercent={method.destacado ? (cot?.discount ?? 0) : 0}
                      quotationImporte={cot?.costoServicioRaw ?? null}
                      isSelected={Boolean(method.destacado)}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="partners-result-fineprint mx-auto mt-4 max-w-[880px] text-[12px] font-bold text-label/45">
              Correspondiente a un alquiler mensual de {formatArs(alquiler)} y expensas de {formatArs(expensas)}.
              Valor final con IVA incluido por un contrato de {duracionAnios * 12} meses.
            </p>
          </div>
        </div>
      </section>

      <PartnersCommissionBanner
        importeConIva={priceFinal ?? cot?.costoServicioRaw ?? null}
        commissionPercent={commissionPercent}
      />
      <PartnersCertificatePlaceholder />
    </div>
  );
}

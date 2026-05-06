'use client';

import type { Qualification, QualificationPaymentMethod } from '@/lib/quotation.api';
import { formatArs } from '@/lib/format-currency';
import { QuotationEditPanel } from '@/components/quotation-edit-panel';
import { QuoterPlanCard } from '@/components/quoter-plan-card';
import { PartnersCommissionBanner } from '@/components/partners-result/partners-commission-banner';
import { PartnersCertificatePlaceholder } from '@/components/partners-result/partners-certificate-placeholder';
import { buildPartnersCertificateQrValue } from '@/lib/partners-certificate-qr';

type CotizacionLike = NonNullable<Qualification['api_res_data']>['cotizacion'];

function computePartnersDiscountPercent(cot: CotizacionLike | undefined): number {
  if (!cot) return 0;
  const fromApi = Number(cot.discount ?? 0);
  if (Number.isFinite(fromApi) && fromApi > 0) return Math.round(fromApi);
  const raw = cot.costoServicioRaw;
  const final = cot.costoServicio;
  if (raw != null && final != null && raw > 0 && raw > final) {
    return Math.round((1 - final / raw) * 100);
  }
  return 0;
}

/** Importe sin cupón (tachado): preferimos API; si solo hay % y final, estimamos el bruto. */
function resolveSinDescuentoImporte(
  priceRaw: number | null,
  priceFinal: number | null | undefined,
  discountPct: number,
): number | null {
  if (priceFinal == null || !Number.isFinite(priceFinal)) return null;
  if (priceRaw != null && priceRaw > priceFinal) return priceRaw;
  if (discountPct > 0 && discountPct < 100) {
    return Math.round(priceFinal / (1 - discountPct / 100));
  }
  return null;
}

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
  const priceRaw = cot?.costoServicioRaw ?? null;
  const discountPct = computePartnersDiscountPercent(cot);
  const showCouponPriceVariant =
    discountPct > 0 && priceFinal != null && Number.isFinite(priceFinal);
  const sinDescuentoImporte = resolveSinDescuentoImporte(priceRaw, priceFinal, discountPct);

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

            {showCouponPriceVariant ? (
              <div className="partners-result-price partners-result-price--coupon mx-auto mt-4 flex max-w-[320px] flex-col items-center sm:mt-5">
                <span className="text-center font-extrabold leading-snug text-[15px] text-[var(--primary)] sm:text-[17px]">
                  Precio final con cupón
                </span>
                <div className="relative mt-7 w-full">
                  <div className="absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--primary)] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-[0_2px_10px_rgba(255,54,108,0.35)] sm:text-[12px]">
                    {discountPct}% OFF
                  </div>
                  <div className="partners-result-price-pill flex min-h-[56px] w-full min-w-[170px] items-center justify-center rounded-lg bg-[#1b1b44] px-5 text-[22px] font-extrabold text-white">
                    {formatArs(priceFinal)}
                  </div>
                </div>
                {sinDescuentoImporte != null ? (
                  <p className="mt-3 text-center text-[13px] font-semibold text-[#837F9B]">
                    <span>Sin descuento </span>
                    <span className="line-through decoration-[#837F9B]">{formatArs(sinDescuentoImporte)}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="partners-result-price mt-4 sm:mt-5 flex flex-col items-center gap-1">
                <span className="partners-result-price-label text-[12px] font-extrabold text-[var(--primary)]">
                  Precio final
                </span>
                <div className="partners-result-price-pill min-w-[170px] rounded-lg bg-[#1b1b44] px-4 py-2 text-[22px] font-extrabold text-white">
                  {formatArs(priceFinal)}
                </div>
              </div>
            )}

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
      <PartnersCertificatePlaceholder qrValue={buildPartnersCertificateQrValue(qualification)} />
    </div>
  );
}

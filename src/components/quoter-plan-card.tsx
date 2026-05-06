'use client';

import type { QualificationPaymentMethod } from '@/lib/quotation.api';

type QuoterPlanCardProps = {
  plan: QualificationPaymentMethod;
  /** Porcentaje de descuento (ej 15). Solo afecta precio principal y muestra tachado. */
  offPercent?: number;
  /** Importe “base” para comparar y mostrar tachado (cuando plan no trae el original). */
  quotationImporte?: number | null;
  /** Para forzar estado seleccionado (estilos). */
  isSelected?: boolean;
};

function formatArs(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '-';
  return `$${Number(value).toLocaleString('es-AR')}`;
}

function getCftText(infoTexto?: string): string {
  const match = infoTexto?.match(/CFT:\s*([\d.,]+)%/);
  if (!match?.[1]) return 'CFT: 0%';
  const value = parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(value)) return 'CFT: 0%';
  const formatted = value % 1 === 0 ? value.toFixed(0) : match[1];
  return `CFT: ${formatted}%`;
}

function ceilPrice(value: number): number {
  return Math.ceil(value);
}

function computeMainPrice(plan: QualificationPaymentMethod, offPercent: number): number {
  const raw = plan.importe ?? 0;
  const discounted = raw - (raw * offPercent) / 100;
  const divisor = plan.orden === 2 ? 3 : 1;
  return ceilPrice(discounted / divisor);
}

export function QuoterPlanCard({ plan, offPercent = 0, quotationImporte = null, isSelected = false }: QuoterPlanCardProps) {
  const isFeatured = Boolean(plan.destacado);

  const precioTexto = (plan.precioTexto ?? '').toLowerCase();
  const isCuota = plan.orden === 2 || precioTexto === 'cuotas' || plan.cuotas > 1;
  const priceLabel = isCuota ? '/ por cuota' : '/ total';

  const showTachadoByOff = offPercent > 0 && !isSelected;
  const showTachadoByQuotation =
    !isSelected &&
    precioTexto !== 'cuotas' &&
    quotationImporte != null &&
    plan.importe != null &&
    quotationImporte !== plan.importe;

  const showTachado = (isFeatured && offPercent > 0) || showTachadoByOff || showTachadoByQuotation;
  const originalValue = showTachadoByOff
    ? plan.importe
    : showTachadoByQuotation
      ? quotationImporte
      : null;

  const mainPrice = computeMainPrice(plan, offPercent);
  const formattedMain = Number.isFinite(mainPrice) ? mainPrice.toLocaleString('es-AR') : '-';

  const finalPriceTotal =
    plan.importeTotal ?? (plan.importe != null && !isCuota ? plan.importe : null);

  const featuredOriginal = isFeatured ? plan.importe : null;
  const showFeaturedOff = isFeatured && offPercent > 0;

  return (
    <div
      className={[
        // keep the class hooks, but do not depend on globals.css
        'pp-quoter-plan',
        isFeatured ? 'is-featured' : '',
        isSelected ? 'is-selected' : '',
        // ported visual styles (from web quoter-plan.component.scss)
        'relative flex h-full flex-col overflow-visible rounded-[20px] border-2 border-transparent p-6 transition-all duration-300',
        isSelected ? 'z-[2] bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(233,30,99,0.3)]' : 'bg-[#EEF3FE]',
        !isSelected ? 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[var(--primary)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={plan.texto}
    >
      {isFeatured && (
        <div
          className={[
            'pp-quoter-plan-badge',
            'mb-2 inline-flex w-fit items-center justify-center rounded-[5px] px-5 py-[6px] text-[12px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
            isSelected ? 'bg-[#ff7298] text-white' : 'bg-[var(--primary)] text-white',
          ].join(' ')}
        >
          Más elegido
        </div>
      )}

      <div className="pp-quoter-plan-price mt-2 text-left">
        <div
          className={[
            'pp-quoter-plan-price-original',
            'mb-1 min-h-[1.2em] text-[14px]',
            isSelected ? 'text-white/70' : 'text-[#837F9B]',
          ].join(' ')}
          aria-hidden={!showTachado}
        >
          {showTachado && (
            <span className="pp-quoter-plan-price-original-line line-through">
              {formatArs(
                (isFeatured ? featuredOriginal : (originalValue ?? undefined)) as number | undefined,
              )}
            </span>
          )}
        </div>

        <div className={['pp-quoter-plan-price-main', isSelected ? 'text-white' : 'text-[var(--primary)]'].join(' ')}>
          <span className="pp-quoter-plan-price-main-value">
            ${formattedMain}
          </span>
          <span className="pp-quoter-plan-price-main-label">
            {priceLabel}
          </span>
        </div>
      </div>

      {isFeatured ? (
        <div className="my-5 w-full border-t-2 border-white/30" aria-hidden="true" />
      ) : (
        <div className="pp-quoter-plan-divider" aria-hidden="true" />
      )}

      <div className="pp-quoter-plan-info mb-4 min-h-[7.25rem] text-left">
        <h3
          className={[
            'pp-quoter-plan-title',
            'm-0 line-clamp-2 min-h-[2.4em] text-[24px] font-extrabold leading-[1.2]',
            isSelected ? 'text-white' : 'text-[#0f0054]',
          ].join(' ')}
        >
          {isFeatured ? plan.texto : plan.texto.toLowerCase()}
        </h3>

        <div
          className={[
            'pp-quoter-plan-final',
            'mt-3 flex flex-col gap-1 text-[14px] font-semibold',
            isFeatured
              ? (isSelected ? 'text-white' : 'text-[#837F9B]')
              : 'text-[#6b6f85]',
          ].join(' ')}
        >
          {showFeaturedOff && (
            <span className={isSelected ? 'text-white font-bold' : 'text-[var(--primary)] font-bold'}>
              {offPercent}% off
            </span>
          )}
          {(plan.importeAdelanto ?? 0) > 0 && (
            <span>Precio adel: {formatArs(plan.importeAdelanto)}</span>
          )}
          {finalPriceTotal != null && (
            <span>Precio final: {formatArs(finalPriceTotal)}</span>
          )}
          <span
            className={[
              'pp-quoter-plan-cft',
              isSelected ? 'text-white' : 'text-[#837F9B]',
              'text-[13px] font-normal',
            ].join(' ')}
          >
            {getCftText(plan.infoTexto)}
          </span>
        </div>
      </div>

      <div
        className={[
          'pp-quoter-plan-payment',
          'mt-auto mb-3 text-[18px] font-extrabold',
          isSelected ? 'text-white' : 'text-[var(--primary)]',
        ].join(' ')}
      >
        {plan.subTexto ?? ''}
      </div>
    </div>
  );
}


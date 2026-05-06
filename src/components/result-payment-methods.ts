import type { Qualification, QualificationPaymentMethod } from '@/lib/quotation.api';

function coerceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function normalizePaymentMethod(raw: unknown, idx: number): QualificationPaymentMethod {
  const item = coerceRecord(raw);
  const subTexto = String(item.subTexto ?? item.sub_texto ?? '');
  const infoTexto = String(item.infoTexto ?? item.info_texto ?? '');
  const precioTexto = String(item.precioTexto ?? item.precio_texto ?? '');
  const texto = String(item.texto ?? '');

  return {
    _id: String(item._id ?? `pm_${idx}`),
    orden: Number(item.orden ?? idx),
    cuotas: Number(item.cuotas ?? 0),
    visible: item.visible !== false,
    destacado: Boolean(item.destacado),
    texto,
    subTexto: subTexto || undefined,
    precioTexto: precioTexto || undefined,
    infoTexto: infoTexto || undefined,
    importe: Number(item.importe ?? 0),
    importeTotal: item.importeTotal != null ? Number(item.importeTotal) : undefined,
    importeCuota: item.importeCuota != null ? Number(item.importeCuota) : undefined,
    importeAdelanto: item.importeAdelanto != null ? Number(item.importeAdelanto) : undefined,
  };
}

export function paymentMethodsFromCotizacion(apiRes: Qualification['api_res_data']): QualificationPaymentMethod[] {
  const cot = apiRes?.cotizacion;
  if (!cot) return [];
  const raw = cot.facilidadesPago ?? cot.facilita_desPago ?? [];
  return raw.map((row, idx) => normalizePaymentMethod(row, idx));
}

export function displayPlanAmount(method: QualificationPaymentMethod): number {
  if (method.cuotas <= 1) {
    return method.importeTotal ?? method.importe;
  }
  return method.importeCuota ?? method.importe;
}

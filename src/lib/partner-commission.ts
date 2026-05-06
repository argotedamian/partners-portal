const IVA_MULTIPLICADOR = 1.21;

/**
 * Comisión en dinero: se aplica el % de comisión sobre el importe neto (sin IVA 21%),
 * asumiendo que `importeConIva` incluye IVA: neto = importeConIva / 1,21.
 */
export function computePartnerCommissionInMoney(
  importeConIva: number | null | undefined,
  commissionPercent: number | null | undefined,
): number | null {
  if (importeConIva == null || !Number.isFinite(importeConIva) || importeConIva <= 0) {
    return null;
  }
  if (commissionPercent == null || !Number.isFinite(commissionPercent) || commissionPercent < 0) {
    return null;
  }
  const netoSinIva = importeConIva / IVA_MULTIPLICADOR;
  return Math.round(netoSinIva * (commissionPercent / 100));
}

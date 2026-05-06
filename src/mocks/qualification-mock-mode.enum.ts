import type { MockIntermediateStatusId } from '@/mocks/qualification-status-id.enum';
import { QualificationStatusId } from '@/mocks/qualification-status-id.enum';

/**
 * Valores permitidos en `NEXT_PUBLIC_USE_MOCK_RESULT` para forzar una respuesta mock.
 * Cualquier otro valor (o vacío) → se llama a la API real.
 */
export enum QualificationMockMode {
  ApprovedQuotation = '1',
  Rejected = 'rejected',
  RejectedStatus7 = '7',
  RejectedStatus8 = '8',
  AlmostApproved = '6',
  CoApplicant = '9',
  IdentityMismatch = '11',
  TechnicalError = '13',
}

const MOCK_MODE_VALUES = new Set<string>(Object.values(QualificationMockMode));

export function parseQualificationMockMode(raw: string | undefined): QualificationMockMode | null {
  const t = raw?.trim() ?? '';
  if (!t) return null;
  if (t.toLowerCase() === QualificationMockMode.Rejected) {
    return QualificationMockMode.Rejected;
  }
  if (MOCK_MODE_VALUES.has(t)) {
    return t as QualificationMockMode;
  }
  return null;
}

/** Variante de rechazo mock (`7` vs `8`). */
export function rejectedVariantFromMockMode(
  mode: QualificationMockMode,
): QualificationStatusId.Rejected | QualificationStatusId.RejectedAlternate {
  if (mode === QualificationMockMode.RejectedStatus8) {
    return QualificationStatusId.RejectedAlternate;
  }
  return QualificationStatusId.Rejected;
}

/** Mapea el modo de entorno al `status_id` intermedio (6, 9, 11, 13). */
export function intermediateStatusIdFromMockMode(
  mode: QualificationMockMode,
): MockIntermediateStatusId | null {
  switch (mode) {
    case QualificationMockMode.AlmostApproved:
      return QualificationStatusId.AlmostApproved;
    case QualificationMockMode.CoApplicant:
      return QualificationStatusId.CoApplicant;
    case QualificationMockMode.IdentityMismatch:
      return QualificationStatusId.IdentityMismatch;
    case QualificationMockMode.TechnicalError:
      return QualificationStatusId.TechnicalError;
    default:
      return null;
  }
}

import { EMPLOYMENT_STUDENT_ID } from '@/lib/constants';
import { QualificationStatusId } from '@/mocks/qualification-status-id.enum';
import type { Qualification } from '@/lib/quotation.api';

/** `App\Models\DocumentType::PASSPORT` y opción Pasaporte del formulario partners. */
export const DOCUMENT_TYPE_PASSPORT_ID = 2;

/**
 * Techo alquiler + expensas para estudiantes en regla pasaporte (APROBADO vs CASI_APROBADO).
 * Mantener alineado con `api/src/settings/settings.js` → `Parametros.alquilerMaximoEstudiantes`.
 */
export const MAX_STUDENT_TOTAL_RENT_PLUS_EXPENSES_ARS = 850_000;

export type PassportAlignmentInput = {
  document_type_id: number;
  employment_situation_id: number;
  rent: number;
  expenses: number;
};

/**
 * Regla motor Node `calificacionIndividuo.calificarDupla` (un solo solicitante con pasaporte).
 * Si no es pasaporte, no aplica corrección desde el cliente.
 */
export function getPassportAlignedStatusId(input: PassportAlignmentInput): QualificationStatusId | null {
  if (input.document_type_id !== DOCUMENT_TYPE_PASSPORT_ID) return null;

  const totalRent = input.rent + input.expenses;
  if (
    input.employment_situation_id === EMPLOYMENT_STUDENT_ID &&
    totalRent <= MAX_STUDENT_TOTAL_RENT_PLUS_EXPENSES_ARS
  ) {
    return QualificationStatusId.ApprovedQuotation;
  }

  return QualificationStatusId.AlmostApproved;
}

/**
 * Corrige solo transiciones 4↔6 cuando el solicitante tiene pasaporte, para igualar la API legacy.
 * No modifica rechazos u otros estados.
 */
export function alignQualificationStatusForPassport(
  qualification: Qualification,
  input: PassportAlignmentInput,
): Qualification {
  const expected = getPassportAlignedStatusId(input);
  if (expected === null) return qualification;

  const current = qualification.status_id;
  if (current !== QualificationStatusId.ApprovedQuotation && current !== QualificationStatusId.AlmostApproved) {
    return qualification;
  }

  if (current === expected) return qualification;

  return { ...qualification, status_id: expected };
}

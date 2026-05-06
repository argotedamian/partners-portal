/**
 * IDs de estado de calificación Hoggax (`Qualification.status_id`).
 * Alineado con las ramas de `components/result.tsx` y la API.
 */
export enum QualificationStatusId {
  ApprovedQuotation = 4,
  AlmostApproved = 6,
  Rejected = 7,
  RejectedAlternate = 8,
  CoApplicant = 9,
  IdentityMismatch = 11,
  TechnicalError = 13,
}

/** Subconjunto usado por mocks de estados “intermedios” (no cotización ni rechazo genérico). */
export type MockIntermediateStatusId =
  | QualificationStatusId.AlmostApproved
  | QualificationStatusId.CoApplicant
  | QualificationStatusId.IdentityMismatch
  | QualificationStatusId.TechnicalError;

export const MOCK_INTERMEDIATE_STATUS_IDS: readonly MockIntermediateStatusId[] = [
  QualificationStatusId.AlmostApproved,
  QualificationStatusId.CoApplicant,
  QualificationStatusId.IdentityMismatch,
  QualificationStatusId.TechnicalError,
];

export function isMockIntermediateStatusId(value: number): value is MockIntermediateStatusId {
  return (MOCK_INTERMEDIATE_STATUS_IDS as readonly number[]).includes(value);
}

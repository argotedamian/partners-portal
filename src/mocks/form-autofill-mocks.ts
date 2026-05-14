import type { FormValues } from '@/hooks/useQuotationFlow';

/**
 * Mocks para pre-rellenar el formulario y saltear la API.
 * Activar con NEXT_PUBLIC_MOCK_INDEX=<índice> en .env.local.
 *
 * DNI (0–4):
 *   0 — Estudiante universitario
 *   1 — Jubilado/a
 *   2 — Monotributista
 *   3 — Relación de dependencia
 *   4 — Responsable inscripto
 *
 * Pasaporte (5–9):
 *   5 — Estudiante universitario
 *   6 — Jubilado/a
 *   7 — Monotributista
 *   8 — Relación de dependencia
 *   9 — Responsable inscripto
 */

const COMMON_QUOTATION: FormValues['quotation'] = {
  rent: 200000,
  expenses: 50000,
  term: 2,
  discount_code: '',
};

const DNI_BASE = {
  document_type_id: 1,
  document_value: '12345678',
  gender_id: 1,
  phone_country_code: '+54',
  phone: '1123456789',
  email: 'inquilino@test.com',
  first_name: '',
  last_name: '',
};

const PASSPORT_BASE = {
  document_type_id: 2,
  document_value: 'AB123456',
  gender_id: 1,
  phone_country_code: '+54',
  phone: '1123456789',
  email: 'inquilino@test.com',
  first_name: 'Test',
  last_name: 'Mock',
};

const STUDENT_EXTRAS = { antiquity_id: null, monthly_income: null };
const EMPLOYED_EXTRAS = { antiquity_id: 2, monthly_income: 500000 };

function makeMock(
  docBase: typeof DNI_BASE | typeof PASSPORT_BASE,
  employment_situation_id: number,
): FormValues {
  const extras = employment_situation_id === 1 ? STUDENT_EXTRAS : EMPLOYED_EXTRAS;
  return {
    user_personal_data: { ...docBase, employment_situation_id, ...extras },
    quotation: COMMON_QUOTATION,
    agent_email: '',
    send_agent_email_to_tenant: false,
  };
}

export const FORM_AUTOFILL_MOCKS: readonly FormValues[] = [
  makeMock(DNI_BASE, 1),       // 0: DNI + Estudiante universitario
  makeMock(DNI_BASE, 2),       // 1: DNI + Jubilado/a
  makeMock(DNI_BASE, 3),       // 2: DNI + Monotributista
  makeMock(DNI_BASE, 4),       // 3: DNI + Relación de dependencia
  makeMock(DNI_BASE, 5),       // 4: DNI + Responsable inscripto
  makeMock(PASSPORT_BASE, 1),  // 5: Pasaporte + Estudiante universitario
  makeMock(PASSPORT_BASE, 2),  // 6: Pasaporte + Jubilado/a
  makeMock(PASSPORT_BASE, 3),  // 7: Pasaporte + Monotributista
  makeMock(PASSPORT_BASE, 4),  // 8: Pasaporte + Relación de dependencia
  makeMock(PASSPORT_BASE, 5),  // 9: Pasaporte + Responsable inscripto
];

export function getAutofillMock(): FormValues | null {
  const raw = process.env.NEXT_PUBLIC_MOCK_INDEX?.trim();
  if (!raw) return null;
  const idx = parseInt(raw, 10);
  return FORM_AUTOFILL_MOCKS[idx] ?? null;
}

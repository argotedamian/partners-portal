import partnersData from '../../public/mocks/partners.json';
import { PARTNERS_AGENTS } from '@/lib/constants';
import type { SessionState } from '@/state/appState.types';

export type PartnerMockRow = {
  fullname: string;
  email: string;
  logo: string;
  comision: number;
};

export const PARTNERS_MOCK_LIST: PartnerMockRow[] = partnersData as PartnerMockRow[];

const EMAIL_INDEX = new Map(
  PARTNERS_MOCK_LIST.map((p) => [p.email.trim().toLowerCase(), p] as const),
);

/** Email permitido para gestionar según mock estático `/public/mocks/partners.json`. */
export function isAllowedAdvisorEmailFromMock(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (!email) return false;
  return EMAIL_INDEX.has(email);
}

/** Fila del mock o `null` si el correo no está en la lista. */
export function getPartnerFromMockByEmail(value: string): SessionState['partner'] {
  const email = value.trim().toLowerCase();
  if (!email) return null;
  const row = EMAIL_INDEX.get(email);
  return row ? { ...row } : null;
}

/** Para payloads y mocks: datos de contacto/nombre para el asesor según selección. */
export function resolvePartnerAgent(agentEmail: string): {
  email: string;
  displayName: string;
  phone: string;
} {
  const trimmed = agentEmail.trim();
  const mock = trimmed ? EMAIL_INDEX.get(trimmed.toLowerCase()) : undefined;
  const legacy = PARTNERS_AGENTS.find(
    (a) => a.email.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  return {
    email: mock?.email ?? trimmed,
    displayName: mock?.fullname ?? legacy?.label ?? trimmed,
    phone: legacy?.phone ?? '',
  };
}

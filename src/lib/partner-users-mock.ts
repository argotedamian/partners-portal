import usersData from '../../public/mocks/partner-users.json';

export type PartnerUserMockRow = {
  email: string;
  password: string;
};

export const PARTNER_USERS_MOCK_LIST: PartnerUserMockRow[] = usersData as PartnerUserMockRow[];

const USER_INDEX = new Map(
  PARTNER_USERS_MOCK_LIST.map((u) => [u.email.trim().toLowerCase(), u] as const),
);

export function isValidPartnerMockCredentials(params: { email: string; password: string }): boolean {
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  if (!email || !password) return false;
  const row = USER_INDEX.get(email);
  return row?.password === password;
}


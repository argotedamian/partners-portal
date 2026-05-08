export type AuthSession = {
  email: string;
  expiresAt: number;
};

const STORAGE_KEY = 'partnersPortalSession';
const DEFAULT_TTL_MS = 20 * 60 * 1000;

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { email?: unknown; expiresAt?: unknown };
  return typeof maybe.email === 'string' && typeof maybe.expiresAt === 'number';
}

export function writeSession(params: { email: string; ttlMs?: number }): AuthSession {
  const ttlMs = params.ttlMs ?? DEFAULT_TTL_MS;
  const session: AuthSession = {
    email: params.email.trim(),
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function readSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isAuthSession(parsed)) return null;
    if (!parsed.email.trim()) return null;
    if (!Number.isFinite(parsed.expiresAt)) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return { email: parsed.email.trim(), expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export function getRemainingSessionMs(session: AuthSession): number {
  return Math.max(0, session.expiresAt - Date.now());
}


'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getRemainingSessionMs, readSession } from '@/lib/auth-session';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import { selectAdvisorEmail } from '@/state/appState.selectors';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const advisorEmail = selectAdvisorEmail(useAppState());

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);

    if (!pathname) return;
    if (pathname.startsWith('/compartir-certificado')) return;
    if (pathname.startsWith('/login')) return;

    const session = readSession();
    if (!session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (advisorEmail.trim().toLowerCase() !== session.email.trim().toLowerCase()) {
      dispatch({ type: 'quotation/setAdvisorEmail', payload: session.email });
    }

    const remaining = getRemainingSessionMs(session);
    logoutTimer.current = setTimeout(() => {
      clearSession();
      dispatch({ type: 'quotation/setAdvisorEmail', payload: '' });
      dispatch({ type: 'quotation/resetQualification' });
      router.replace('/login');
    }, remaining);

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [advisorEmail, dispatch, pathname, router]);

  return children;
}


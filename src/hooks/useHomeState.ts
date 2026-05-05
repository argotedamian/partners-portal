'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import {
  selectAdvisorEmail,
  selectIsMounted,
  selectPartner,
  selectQualification,
} from '@/state/appState.selectors';
import type { Qualification } from '@/lib/quotation.api';
import partnersMock from '../../public/mocks/partners.json';

const MOCK_ADVISOR_EMAILS = new Set(
  partnersMock
    .map((partner) => partner.email?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email)),
);

type AdvisorEmailValidation =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'valid' }
  | { status: 'invalid'; message: string };

function isMockAdvisorEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return false;

  const hasValidEmailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!hasValidEmailShape) return false;

  return MOCK_ADVISOR_EMAILS.has(email);
}

function getMockPartnerByEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return null;

  return (
    partnersMock.find((partner) => partner.email?.trim().toLowerCase() === email) ?? null
  );
}

export function useHomeState() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [advisorEmailValidation, setAdvisorEmailValidation] = useState<AdvisorEmailValidation>({ status: 'idle' });
  const advisorEmailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMounted = selectIsMounted(state);
  const qualification = selectQualification(state);
  const advisorEmail = selectAdvisorEmail(state);
  const partner = selectPartner(state);

  useEffect(() => {
    dispatch({ type: 'ui/setMounted', payload: true });
  }, [dispatch]);

  useEffect(() => {
    if (!searchParams) return;
    if (!searchParams.get('reset')) return;
    dispatch({ type: 'quotation/resetQualification' });
    router.replace('/');
  }, [dispatch, router, searchParams]);

  useEffect(() => {
    if (advisorEmailTimer.current) clearTimeout(advisorEmailTimer.current);

    const email = advisorEmail.trim();
    if (!email) {
      setAdvisorEmailValidation({ status: 'idle' });
      dispatch({ type: 'session/setAuthenticated', payload: false });
      dispatch({ type: 'session/setPartner', payload: null });
      return;
    }

    setAdvisorEmailValidation({ status: 'loading' });
    advisorEmailTimer.current = setTimeout(() => {
      const isValid = isMockAdvisorEmail(email);
      const partner = isValid ? getMockPartnerByEmail(email) : null;
      dispatch({ type: 'session/setAuthenticated', payload: isValid });
      dispatch({ type: 'session/setPartner', payload: partner });
      setAdvisorEmailValidation(
        isValid
          ? { status: 'valid' }
          : { status: 'invalid', message: 'El correo no es válido. Usá un email de asesor habilitado.' },
      );
    }, 650);

    return () => {
      if (advisorEmailTimer.current) clearTimeout(advisorEmailTimer.current);
    };
  }, [advisorEmail, dispatch]);

  function setQualification(value: Qualification | null) {
    dispatch({ type: 'quotation/setQualification', payload: value });
  }

  function setAdvisorEmail(value: string) {
    dispatch({ type: 'quotation/setAdvisorEmail', payload: value });
  }

  return {
    isMounted,
    qualification,
    advisorEmail,
    partner,
    advisorEmailValidation,
    setQualification,
    setAdvisorEmail,
  };
}


'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import {
  selectIsMounted,
  selectPartner,
  selectQualification,
  selectAdvisorEmail,
} from '@/state/appState.selectors';
import type { Qualification } from '@/lib/quotation.api';
import { getPartnerFromMockByEmail } from '@/lib/partners-mock';

export function useHomeState() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    const email = advisorEmail.trim();
    if (!email) {
      dispatch({ type: 'session/setAuthenticated', payload: false });
      dispatch({ type: 'session/setPartner', payload: null });
      return;
    }

    const nextPartner = getPartnerFromMockByEmail(email);
    if (nextPartner) {
      dispatch({ type: 'session/setAuthenticated', payload: true });
      dispatch({ type: 'session/setPartner', payload: nextPartner });
    } else {
      dispatch({ type: 'session/setAuthenticated', payload: false });
      dispatch({ type: 'session/setPartner', payload: null });
    }
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
    setQualification,
    setAdvisorEmail,
  };
}

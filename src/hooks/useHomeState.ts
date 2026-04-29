'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import {
  selectAdvisorEmail,
  selectIsMounted,
  selectQualification,
} from '@/state/appState.selectors';
import type { Qualification } from '@/lib/quotation.api';

export function useHomeState() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMounted = selectIsMounted(state);
  const qualification = selectQualification(state);
  const advisorEmail = selectAdvisorEmail(state);

  useEffect(() => {
    dispatch({ type: 'ui/setMounted', payload: true });
  }, [dispatch]);

  useEffect(() => {
    if (!searchParams) return;
    if (!searchParams.get('reset')) return;
    dispatch({ type: 'quotation/resetQualification' });
    router.replace('/');
  }, [dispatch, router, searchParams]);

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
    setQualification,
    setAdvisorEmail,
  };
}


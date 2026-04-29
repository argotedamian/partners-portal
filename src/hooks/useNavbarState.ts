'use client';

import { useAppState } from '@/state/AppStateContext';
import {
  selectAdvisorLabel,
  selectIsAuthenticated,
  selectPartnerLogoSrc,
} from '@/state/appState.selectors';

export function useNavbarState() {
  const state = useAppState();

  return {
    isAuthenticated: selectIsAuthenticated(state),
    advisorLabel: selectAdvisorLabel(state),
    partnerLogoSrc: selectPartnerLogoSrc(state),
  };
}


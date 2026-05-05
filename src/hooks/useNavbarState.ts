'use client';

import { useAppState } from '@/state/AppStateContext';
import {
  selectAdvisorLabel,
  selectIsAuthenticated,
  selectPartner,
  selectPartnerLogoSrc,
} from '@/state/appState.selectors';

export function useNavbarState() {
  const state = useAppState();

  const partner = selectPartner(state);

  return {
    isAuthenticated: selectIsAuthenticated(state),
    advisorLabel: partner?.fullname ?? selectAdvisorLabel(state),
    partnerLogoSrc: partner?.logo ?? selectPartnerLogoSrc(state),
    partner,
  };
}


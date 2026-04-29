import type { Qualification } from '@/lib/quotation.api';

export type SessionState = {
  isAuthenticated: boolean;
  advisorLabel: string;
  partnerLogoSrc: string;
};

export type QuotationState = {
  qualification: Qualification | null;
  advisorEmail: string;
};

export type UiState = {
  isMounted: boolean;
};

export type AppState = {
  session: SessionState;
  quotation: QuotationState;
  ui: UiState;
};

export type AppStateAction =
  | { type: 'session/setAuthenticated'; payload: boolean }
  | { type: 'session/setAdvisorLabel'; payload: string }
  | { type: 'quotation/setQualification'; payload: Qualification | null }
  | { type: 'quotation/resetQualification' }
  | { type: 'quotation/setAdvisorEmail'; payload: string }
  | { type: 'ui/setMounted'; payload: boolean };


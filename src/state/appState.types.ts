import type { Qualification } from '@/lib/quotation.api';

export type SessionState = {
  isAuthenticated: boolean;
  advisorLabel: string;
  partnerLogoSrc: string;
  partner: {
    fullname: string;
    email: string;
    logo: string;
    comision: number;
  } | null;
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
  | { type: 'session/setPartner'; payload: SessionState['partner'] }
  | { type: 'quotation/setQualification'; payload: Qualification | null }
  | { type: 'quotation/resetQualification' }
  | { type: 'quotation/setAdvisorEmail'; payload: string }
  | { type: 'ui/setMounted'; payload: boolean };


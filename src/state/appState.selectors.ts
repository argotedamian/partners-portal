import type { AppState } from './appState.types';

export const selectIsAuthenticated = (state: AppState) => state.session.isAuthenticated;
export const selectAdvisorLabel = (state: AppState) => state.session.advisorLabel;
export const selectPartnerLogoSrc = (state: AppState) => state.session.partnerLogoSrc;
export const selectAdvisorEmail = (state: AppState) => state.quotation.advisorEmail;
export const selectQualification = (state: AppState) => state.quotation.qualification;
export const selectIsMounted = (state: AppState) => state.ui.isMounted;


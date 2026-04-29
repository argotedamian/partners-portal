import type { AppState, AppStateAction } from './appState.types';

export const initialAppState: AppState = {
  session: {
    isAuthenticated: false,
    advisorLabel: 'Datos del asesor',
    partnerLogoSrc: '/logo-partner-mock.svg',
  },
  quotation: {
    qualification: null,
    advisorEmail: '',
  },
  ui: {
    isMounted: false,
  },
};

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'session/setAuthenticated':
      return {
        ...state,
        session: {
          ...state.session,
          isAuthenticated: action.payload,
        },
      };
    case 'session/setAdvisorLabel':
      return {
        ...state,
        session: {
          ...state.session,
          advisorLabel: action.payload,
        },
      };
    case 'quotation/setQualification':
      return {
        ...state,
        quotation: {
          ...state.quotation,
          qualification: action.payload,
        },
      };
    case 'quotation/resetQualification':
      return {
        ...state,
        quotation: {
          ...state.quotation,
          qualification: null,
        },
      };
    case 'quotation/setAdvisorEmail':
      return {
        ...state,
        quotation: {
          ...state.quotation,
          advisorEmail: action.payload,
        },
      };
    case 'ui/setMounted':
      return {
        ...state,
        ui: {
          ...state.ui,
          isMounted: action.payload,
        },
      };
    default:
      return state;
  }
}


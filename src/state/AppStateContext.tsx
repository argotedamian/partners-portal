'use client';

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { appStateReducer, initialAppState } from './appState.reducer';
import type { AppState, AppStateAction } from './appState.types';

type AppStateContextValue = {
  state: AppState;
  dispatch: Dispatch<AppStateAction>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

type AppStateProviderProps = {
  children: ReactNode;
};

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appStateReducer, initialAppState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

function useAppStateContext() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }
  return context;
}

export function useAppState() {
  return useAppStateContext().state;
}

export function useAppDispatch() {
  return useAppStateContext().dispatch;
}


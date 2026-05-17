import { createContext, useContext } from 'react';
import type { SsrPayload } from '../../domain/dto/photo-view.js';

const SsrDataContext = createContext<SsrPayload | null>(null);

export function SsrDataProvider({
  value,
  children,
}: {
  value: SsrPayload | null;
  children: React.ReactNode;
}) {
  return (
    <SsrDataContext.Provider value={value}>{children}</SsrDataContext.Provider>
  );
}

export function useSsrData(): SsrPayload | null {
  return useContext(SsrDataContext);
}

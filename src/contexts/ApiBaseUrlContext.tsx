import { createContext, type ReactNode, useContext } from 'react';

const ApiBaseUrlContext = createContext<string | null>(null);

interface ApiBaseUrlProviderProps {
  apiBaseUrl: string;
  children: ReactNode;
}

export function ApiBaseUrlProvider({
  apiBaseUrl,
  children,
}: ApiBaseUrlProviderProps) {
  return (
    <ApiBaseUrlContext.Provider value={apiBaseUrl}>
      {children}
    </ApiBaseUrlContext.Provider>
  );
}

export function useApiBaseUrl(): string {
  const apiBaseUrl = useContext(ApiBaseUrlContext);

  if (apiBaseUrl === null) {
    throw new Error('useApiBaseUrl must be used within ApiBaseUrlProvider');
  }

  return apiBaseUrl;
}

import { createContext, type ReactNode, useContext } from 'react';

interface SlideshowMetadataContextValue {
  apiBaseUrl: string;
  signalRConnectionId?: string | null;
}

const SlideshowMetadataContext =
  createContext<SlideshowMetadataContextValue | null>(null);

interface SlideshowMetadataProviderProps {
  apiBaseUrl: string;
  signalRConnectionId?: string | null;
  children: ReactNode;
}

export function SlideshowMetadataProvider({
  apiBaseUrl,
  signalRConnectionId,
  children,
}: SlideshowMetadataProviderProps) {
  const contextValue = {
    apiBaseUrl,
    signalRConnectionId,
  };
  return (
    <SlideshowMetadataContext.Provider value={contextValue}>
      {children}
    </SlideshowMetadataContext.Provider>
  );
}

export function useSlideshowMetadata(): SlideshowMetadataContextValue {
  const context = useContext(SlideshowMetadataContext);

  if (context === null) {
    throw new Error(
      'useApiBaseUrlContext must be used within ApiBaseUrlProvider',
    );
  }

  return context;
}

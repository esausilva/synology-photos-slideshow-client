import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { SIGNALR_HUB, WEB_GALLERY } from '~/constants/routes';

const REFRESH_SLIDESHOW = 'RefreshSlideshow';
const PHOTO_PROCESSING_ERROR = 'PhotoProcessingError';
const REFRESH_GALLERY = 'RefreshGallery';
const THUMBNAILS_PROCESSING_ERROR = 'ThumbnailsProcessingError';

interface UseSlideshowSignalRProps {
  apiBaseUrl: string;
}

export interface UseSlideshowSignalRReturn {
  isConnected: boolean;
  connectionId?: string | null;
}

export function useSlideshowSignalR({
  apiBaseUrl,
}: UseSlideshowSignalRProps): UseSlideshowSignalRReturn {
  const router = useRouter();

  // Add a state to let the UI know if we are live or refreshing
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const debouncedInvalidate = useMemo(
    () =>
      debounce({
        fn: () => {
          console.log('SignalR: Executing debounced refresh...');
          router.invalidate();
        },
        ms: 1000,
      }), // Wait for 1 second of "silence" before refreshing
    [router],
  );

  useEffect(() => {
    console.log('SignalR: Initializing SignalR connection...');

    if (!apiBaseUrl) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}${SIGNALR_HUB}`, {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    const onRefresh = () => {
      debouncedInvalidate();
    };

    const onError = (errorMessage: string) => {
      console.error('SignalR: Photo processing error:', errorMessage);
      toast.error(errorMessage, {
        autoClose: false,
      } as const);
    };

    const onRefreshGallery = () => {
      if (router.matchRoute({ to: WEB_GALLERY })) {
        console.log('SignalR: Refreshing gallery...');
        debouncedInvalidate();
      }
    };

    const onThumbnailsError = (errorMessage: string) => {
      if (router.matchRoute({ to: WEB_GALLERY })) {
        console.error('SignalR: Thumbnails processing error:', errorMessage);
        toast.error(errorMessage, {
          autoClose: false,
        } as const);
      }
    };

    connection.on(REFRESH_SLIDESHOW, onRefresh);
    connection.on(PHOTO_PROCESSING_ERROR, onError);
    connection.on(REFRESH_GALLERY, onRefreshGallery);
    connection.on(THUMBNAILS_PROCESSING_ERROR, onThumbnailsError);

    async function startConnection() {
      try {
        await connection.start();
        setIsConnected(true);
        setConnectionId(connection.connectionId);
        console.log('SignalR: Connected to Slideshow Hub');
      } catch (err) {
        console.error('SignalR: Connection failed: ', err);
      }
    }

    startConnection();

    return () => {
      debouncedInvalidate.cancel();

      // Explicitly remove listeners
      connection.off(REFRESH_SLIDESHOW);
      connection.off(PHOTO_PROCESSING_ERROR);
      connection.off(REFRESH_GALLERY);
      connection.off(THUMBNAILS_PROCESSING_ERROR);

      // Stop connection only if it's not already stopping/stopped
      if (connection.state !== HubConnectionState.Disconnected) {
        connection
          .stop()
          .then(() => console.log('SignalR: Disconnected from Slideshow Hub'))
          .catch((err) => console.error('SignalR: Stop Error', err));
      }
      setIsConnected(false);
    };
  }, [apiBaseUrl, debouncedInvalidate, router.matchRoute]);

  return { isConnected, connectionId };
}

function debounce({ fn, ms }: { fn: () => void; ms: number }) {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(), ms);
  };

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced;
}

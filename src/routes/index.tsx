import { Await, createFileRoute, defer, Link } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IconGallery, IconSettings } from '~/components/icons';
import { HomeSkeleton } from '~/components/Slideshow/HomeSkeleton';
import { Slideshow } from '~/components/Slideshow/Slideshow';
import { WEB_HOME } from '~/constants/routes';
import { SlideshowMetadataProvider } from '~/contexts/SlideshowMetadataContext';
import {
  type UseSlideshowSignalRReturn,
  useSlideshowSignalR,
} from '~/hooks/useSlideshowSignalR';
import styles from '~/routes/styles/index.module.css';
import type { Slide } from '~/server-functions';
import { getApiBaseUrlForClient, getSlides } from '~/server-functions';
import {
  getSlideshowSettings,
  initializeDb,
  type SlideshowSettings,
  seedSettings,
} from '~/utils/data-access';

export const Route = createFileRoute(WEB_HOME)({
  component: Home,
  loader: async (): Promise<{
    slides: Promise<Slide[]>;
    apiBaseUrl: string;
    errorMessage: string | null;
  }> => {
    try {
      const apiBaseUrl = await getApiBaseUrlForClient();
      const slidesPromise = getSlides();

      return {
        slides: defer(slidesPromise),
        apiBaseUrl,
        errorMessage: null,
      };
    } catch (error) {
      console.error('Error loading slides: ', error);
      return {
        slides: Promise.resolve([]),
        apiBaseUrl: '',
        errorMessage:
          'Error loading slides. Please verify the Synology Photos Slideshow API is running and accessible.',
      };
    }
  },
});

function Home() {
  const { slides, apiBaseUrl, errorMessage } = Route.useLoaderData();
  const [settings, setSettings] = useState({} as SlideshowSettings);

  const { connectionId: signalRConnectionId }: UseSlideshowSignalRReturn =
    useSlideshowSignalR({
      apiBaseUrl,
    });

  useEffect(() => {
    getSlideshowSettings()
      .then((settings) => {
        if (settings) {
          setSettings(settings);
        } else {
          initializeDb()
            .then(() => setSettings(seedSettings))
            .catch((error) => {
              console.error('Error initializing slideshow settings: ', error);
            });
        }
        console.log('Loaded slideshow settings: ', settings ?? seedSettings);
      })
      .catch((error) => {
        console.error('Error loading slideshow settings: ', error);
      });
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        autoClose: false,
      } as const);
    }
  }, [errorMessage]);

  return (
    <>
      <div className={styles.navLinks}>
        <Link
          to="/gallery"
          className={styles.navLink}
          aria-label="Photo Gallery"
          title="Photo Gallery"
          tabIndex={0}
        >
          <IconGallery />
        </Link>
        <Link
          to="/settings"
          className={styles.navLink}
          aria-label="Slideshow Settings"
          title="Slideshow Settings"
          tabIndex={0}
        >
          <IconSettings />
        </Link>
      </div>
      {errorMessage ? (
        <div className={styles.container}>
          <p>{errorMessage}</p>
        </div>
      ) : (
        <Suspense fallback={<HomeSkeleton delay={500} />}>
          <Await promise={slides}>
            {(slides) =>
              slides.length === 0 ? (
                <div className={styles.container}>
                  <p>No photos here yet 🫣.</p>
                  <p>
                    Just pop over to the{' '}
                    <Link
                      to="/settings"
                      aria-label="Slideshow Settings"
                      title="Slideshow Settings"
                      tabIndex={0}
                    >
                      Settings
                    </Link>{' '}
                    page to download a new batch!
                  </p>
                </div>
              ) : (
                <SlideshowMetadataProvider
                  apiBaseUrl={apiBaseUrl}
                  signalRConnectionId={signalRConnectionId}
                >
                  <Slideshow
                    slides={slides}
                    intervalInMs={settings.intervalInMs}
                    random={settings.random}
                    displayOverlay={settings.displayOverlay ?? true}
                  />
                </SlideshowMetadataProvider>
              )
            }
          </Await>
        </Suspense>
      )}
      <ToastContainer position="top-center" />
    </>
  );
}

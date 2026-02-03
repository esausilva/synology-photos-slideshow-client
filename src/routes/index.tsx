import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IconSettings } from '~/components/icons';
import { Slideshow } from '~/components/Slideshow/Slideshow';
import { WEB_HOME } from '~/constants/routes';
import { ApiBaseUrlProvider } from '~/contexts/ApiBaseUrlContext';
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
    slides: Slide[];
    apiBaseUrl: string;
    errorMessage: string | null;
  }> => {
    try {
      const [slides, apiBaseUrl] = await Promise.all([
        getSlides(),
        getApiBaseUrlForClient(),
      ]);

      return {
        slides,
        apiBaseUrl,
        errorMessage: null,
      };
    } catch (error) {
      console.error('Error loading slides: ', error);
      return {
        slides: [],
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
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <>
      <Link
        to="/settings"
        className={styles.settingsLink}
        aria-label="Slideshow Settings"
        title="Slideshow Settings"
        tabIndex={0}
      >
        <IconSettings />
      </Link>
      {slides.length === 0 ? (
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
        <ApiBaseUrlProvider apiBaseUrl={apiBaseUrl}>
          <Slideshow
            slides={slides}
            intervalInMs={settings.intervalInMs}
            random={settings.random}
          />
        </ApiBaseUrlProvider>
      )}
      <ToastContainer position="top-center" />
    </>
  );
}

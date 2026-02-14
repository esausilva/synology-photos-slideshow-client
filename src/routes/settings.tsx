import { createFileRoute, Link } from '@tanstack/react-router';
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import {
  IconHome,
  IconInterval,
  IconOverlay,
  IconRandom,
} from '~/components/icons';
import { RefreshPhotos } from '~/components/RefreshPhotos/RefreshPhotos';
import { WEB_SETTINGS } from '~/constants/routes';
import styles from '~/routes/styles/settings.module.css';
import { getApiBaseUrlForClient } from '~/server-functions';
import {
  getSlideshowSettings,
  initializeDb,
  type SlideshowSettings,
  seedSettings,
  upsertSlideshowSettings,
} from '~/utils/data-access';

export const Route = createFileRoute(WEB_SETTINGS)({
  component: Settings,
  loader: async () => await getApiBaseUrlForClient(),
});

interface FormState {
  isLoading: boolean;
  random: boolean;
  intervalInSeconds: number;
  displayOverlay: boolean;
}

const initialState: FormState = {
  isLoading: true,
  random: seedSettings.random,
  intervalInSeconds: seedSettings.intervalInMs / 1000,
  displayOverlay: seedSettings.displayOverlay,
};

function Settings() {
  const apiBaseUrl = Route.useLoaderData();
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    getSlideshowSettings()
      .then((settings) => {
        if (settings) {
          setFormState({
            isLoading: false,
            random: settings.random,
            intervalInSeconds: settings.intervalInMs / 1000,
            displayOverlay:
              settings.displayOverlay ?? seedSettings.displayOverlay,
          });
        } else {
          initializeDb()
            .then(() => setFormState({ ...initialState, isLoading: false }))
            .catch((error) => {
              toast.error('Failed to initialize slideshow settings.');
              console.error('Error initializing slideshow settings: ', error);
            });
        }
      })
      .catch((err) => {
        toast.error('Failed to load settings.');
        console.error('Failed to load settings:', err);
      });
  }, []);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { name, value, type, checked } = event.target;
    let newValue: string | number | boolean = value;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'intervalInSeconds') {
      newValue = value === '' || Number.isNaN(value) ? 0 : parseInt(value, 10);
    }
    const state = { ...formState, [name]: newValue };

    try {
      await persistSettings(state);
      setFormState(state);
    } catch (err) {
      toast.error('Failed to save settings.');
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <Link
          to="/"
          className={styles.homeLink}
          aria-label="Slideshow Home"
          title="Slideshow Home"
          tabIndex={0}
        >
          <IconHome />
        </Link>
        <form className={formState.isLoading ? styles.hidden : styles.form}>
          <h1>Slideshow Settings</h1>
          <div className={styles.formGroup}>
            <IconRandom />
            <label htmlFor="random">Random Display</label>
            <input
              type="checkbox"
              id="random"
              name="random"
              checked={formState.random}
              onChange={handleInputChange}
            />

            <IconOverlay />
            <label htmlFor="displayOverlay">Display Slide Overlay</label>
            <input
              type="checkbox"
              id="displayOverlay"
              name="displayOverlay"
              checked={formState.displayOverlay}
              onChange={handleInputChange}
            />

            <IconInterval />
            <label htmlFor="interval-in-seconds">Interval in Seconds</label>
            <input
              type="number"
              id="interval-in-seconds"
              name="intervalInSeconds"
              min={5}
              value={formState.intervalInSeconds}
              onChange={handleInputChange}
            />
          </div>
          <RefreshPhotos apiBaseUrl={apiBaseUrl} />
        </form>
        <p className={styles.footer}>
          Made with ❤️ by{' '}
          <a href="https://www.esausilva.dev/" target="_blank" rel="noopener">
            Esau Silva
          </a>{' '}
        </p>
      </div>
      <ToastContainer position="top-center" />
    </>
  );
}

const persistSettings = async (state: FormState) => {
  const slideshowSettings: SlideshowSettings = {
    random: state.random,
    intervalInMs: state.intervalInSeconds * 1000,
    displayOverlay: state.displayOverlay,
  };

  await upsertSlideshowSettings(slideshowSettings);
};

import { createFileRoute } from '@tanstack/react-router';
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { WEB_SETTINGS } from '~/constants/routes';
import styles from '~/routes/styles/settings.module.css';
import {
  getSlideshowSettings,
  initializeDb,
  type SlideshowSettings,
  seedSettings,
  upsertSlideshowSettings,
} from '~/utils/data-access';

export const Route = createFileRoute(WEB_SETTINGS)({
  component: Settings,
});

interface FormState {
  isLoading: boolean;
  random: boolean;
  intervalInSeconds: number;
}

const initialState: FormState = {
  isLoading: true,
  random: seedSettings.random,
  intervalInSeconds: seedSettings.intervalInMs / 1000,
};

function Settings() {
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    getSlideshowSettings()
      .then((settings) => {
        if (settings) {
          setFormState({
            isLoading: false,
            random: settings.random,
            intervalInSeconds: settings.intervalInMs / 1000,
          });
        } else {
          initializeDb()
            .then(() => setFormState({ ...initialState, isLoading: false }))
            .catch((error) => {
              console.error('Error initializing slideshow settings: ', error);
            });
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
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
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className={styles.container}>
      <form className={formState.isLoading ? styles.hidden : styles.form}>
        <h1>Slideshow Settings</h1>
        <div className={styles.formGroup}>
          <label htmlFor="random">Random Display</label>
          <input
            type="checkbox"
            id="random"
            name="random"
            checked={formState.random}
            onChange={handleInputChange}
          />

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
      </form>
    </div>
  );
}

const persistSettings = async (state: FormState) => {
  const slideshowSettings: SlideshowSettings = {
    random: state.random,
    intervalInMs: state.intervalInSeconds * 1000,
  };

  await upsertSlideshowSettings(slideshowSettings);
};

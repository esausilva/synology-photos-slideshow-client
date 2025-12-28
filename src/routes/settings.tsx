import { createFileRoute } from '@tanstack/react-router';
import type * as React from 'react';
import { useState } from 'react';
import { WEB_SETTINGS } from '~/constants/routes';

import styles from '~/routes/styles/settings.module.css';

export const Route = createFileRoute(WEB_SETTINGS)({
  component: Settings,
});

const initialState: { random: boolean; delayInSeconds: number } = {
  random: true,
  delayInSeconds: 20,
};

function Settings() {
  const [formState, setFormState] = useState(initialState);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value, type, checked } = event.target;
    let newValue: string | number | boolean = value;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'delayInSeconds') {
      newValue = value === '' || Number.isNaN(value) ? 0 : parseInt(value, 10);
    }

    setFormState({ ...formState, [name]: newValue });
  };

  return (
    <div className={styles.container}>
      <form className={styles.form}>
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

          <label htmlFor="delay-in-seconds">Slide Delay in Seconds</label>
          <input
            type="number"
            id="delay-in-seconds"
            name="delayInSeconds"
            min={5}
            value={formState.delayInSeconds}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
}

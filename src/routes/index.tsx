import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Slideshow } from '~/components/Slideshow/Slideshow';
import { WEB_HOME } from '~/constants/routes';
import { getSlides } from '~/server-functions';
import {
  getSlideshowSettings,
  initializeDb,
  type SlideshowSettings,
  seedSettings,
} from '~/utils/data-access';

export const Route = createFileRoute(WEB_HOME)({
  component: Home,
  loader: async () => await getSlides(),
});

function Home() {
  const slides = Route.useLoaderData();
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

  return (
    <Slideshow
      slides={slides}
      intervalInMs={settings.intervalInMs}
      random={settings.random}
    />
  );
}

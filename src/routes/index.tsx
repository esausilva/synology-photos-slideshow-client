import { createFileRoute } from '@tanstack/react-router';
import { WEB_HOME } from '~/constants/routes';
import { getSlides } from '~/server-functions';

import styles from '../styles/index.module.css';

export const Route = createFileRoute(WEB_HOME)({
  component: Home,
  loader: async () => await getSlides(),
});

function Home() {
  const slides = Route.useLoaderData();

  return (
    <div>
      {slides.map((slide) => (
        <img key={slide} src={slide} alt={slide} className={styles.imgCamelCase} />
      ))}
    </div>
  );
}

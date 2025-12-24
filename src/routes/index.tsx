import { createFileRoute } from '@tanstack/react-router';
import { HOME } from '~/constants/routes';
import { getSlides } from '~/server-functions';

export const Route = createFileRoute(HOME)({
  component: Home,
  loader: async () => await getSlides(),
});

function Home() {
  const slides = Route.useLoaderData();

  return (
    <div>
      {slides.map((slide) => (
        <img key={slide} src={slide} alt={slide} />
      ))}
    </div>
  );
}

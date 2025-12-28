import { createFileRoute } from '@tanstack/react-router';
import { Slideshow } from '~/components/Slideshow/Slideshow';
import { WEB_HOME } from '~/constants/routes';
import { getSlides } from '~/server-functions';

export const Route = createFileRoute(WEB_HOME)({
  component: Home,
  loader: async () => await getSlides(),
});

function Home() {
  const slides = Route.useLoaderData();

  return <Slideshow slides={slides} slideDelayInMs={5000} random={true} />;
}

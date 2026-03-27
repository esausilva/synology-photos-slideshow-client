import { createServerFn } from '@tanstack/react-start';
import { API_GET_SLIDES, API_GET_THUMBNAILS } from '~/constants/routes';
import { httpRequest } from '~/utils/http';

export interface Slide {
  url: string;
  dateTaken: Date;
  googleMapsLink: string;
  location: string;
}

interface SlideFromApi extends Slide {
  relativeUrl: string;
}

const getSlides = createServerFn({
  method: 'GET',
}).handler(async (): Promise<Slide[]> => {
  const res = await httpRequest(
    `${process.env.SERVER__API_BASE_URL}${API_GET_SLIDES}`,
  );

  if (!res.ok) {
    throw new Error('Failed to fetch slides');
  }

  const slides: SlideFromApi[] = await res.json();

  return slides.map(
    (slide: SlideFromApi): Slide => ({
      url: `${process.env.CLIENT__API_BASE_URL}${slide.relativeUrl}`,
      dateTaken: new Date(slide.dateTaken),
      googleMapsLink: slide.googleMapsLink,
      location: slide.location,
    }),
  );
});

const getThumbnails = createServerFn({
  method: 'GET',
}).handler(async (): Promise<string[]> => {
  const res = await httpRequest(
    `${process.env.SERVER__API_BASE_URL}${API_GET_THUMBNAILS}`,
  );

  if (!res.ok) {
    throw new Error('Failed to fetch thumbnails');
  }

  const relativeUrls: string[] = await res.json();

  return relativeUrls.map(
    (relativeUrl: string) =>
      `${process.env.CLIENT__API_BASE_URL}${relativeUrl}`,
  );
});

const getApiBaseUrlForClient = createServerFn({ method: 'GET' }).handler(() => {
  const apiBaseUrl = process.env.CLIENT__API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('CLIENT__API_BASE_URL is not defined');
  }

  return apiBaseUrl;
});

export { getSlides, getThumbnails, getApiBaseUrlForClient };

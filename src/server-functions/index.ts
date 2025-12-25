import { createServerFn } from '@tanstack/react-start';
import { API_GET_SLIDES } from '~/constants/routes';

const getSlides = createServerFn({
  method: 'GET',
}).handler(async () => {
  const slideshowApiBaseUrl = process.env.SLIDESHOW_API_BASE_URL;
  const res = await fetch(`${slideshowApiBaseUrl}${API_GET_SLIDES}`);

  if (!res.ok) {
    throw new Error('Failed to fetch slides');
  }

  const slidesUri = await res.json();

  return slidesUri.map(
    (slide: string) => `${slideshowApiBaseUrl}${slide}`,
  ) as string[];
});

export { getSlides };

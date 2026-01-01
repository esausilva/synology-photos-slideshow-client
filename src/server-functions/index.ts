import { createServerFn } from '@tanstack/react-start';
import { API_GET_SLIDES } from '~/constants/routes';

const getSlides = createServerFn({
  method: 'GET',
}).handler(async () => {
  const res = await fetch(
    `${process.env.SERVER__API_BASE_URL}${API_GET_SLIDES}`,
  );

  if (!res.ok) {
    throw new Error('Failed to fetch slides');
  }

  const slidesUri = await res.json();

  return slidesUri.map(
    (slide: string) => `${process.env.CLIENT__API_BASE_URL}${slide}`,
  ) as string[];
});

export { getSlides };

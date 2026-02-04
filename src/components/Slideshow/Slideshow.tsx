import { useCallback, useEffect, useState } from 'react';
import { DeletePhoto } from '~/components/DeletePhoto/DeletePhoto';
import { IconMapMarker } from '~/components/icons';
import type { Slide } from '~/server-functions';
import styles from './Slideshow.module.css';

interface SlideshowProps {
  slides: Slide[];
  intervalInMs?: number;
  random?: boolean;
}

export function Slideshow({
  slides,
  intervalInMs = 20000,
  random = false,
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (random) {
      let nextIndex = getRandomNumber(slides.length);

      // Ensure we don't get the same slide if there's more than one
      if (slides.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % slides.length;
      }

      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
  }, [slides.length, random, currentIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length,
    );
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, intervalInMs);
    return () => clearInterval(interval);
  }, [nextSlide, intervalInMs]);

  useEffect(() => {
    if (random) setCurrentIndex(getRandomNumber(slides.length));
  }, [slides.length, random]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className={styles.slideshowContainer}>
      {!random && (
        <>
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      <div key={currentIndex} className={styles.slide}>
        <DeletePhoto slide={currentSlide.url} />
        <div
          className={styles.background}
          style={{ backgroundImage: `url(${currentSlide.url})` }}
        />
        <div className={styles.imageContainer}>
          <img
            src={currentSlide.url}
            alt={`Slide ${currentIndex}`}
            className={styles.mainImage}
          />
        </div>
        <div className={styles.overlay}>
          {currentSlide.dateTaken &&
            !Number.isNaN(currentSlide.dateTaken.getTime()) && (
              <div>
                {currentSlide.dateTaken.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </div>
            )}
          {currentSlide.googleMapsLink && (
            <a
              href={currentSlide.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconMapMarker />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const getRandomNumber = (max: number): number => {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('"max" must be an integer ≥ 1');
  }

  const range = max; // we want [1, max]
  const maxUint32 = 0xffffffff; // 2^32 - 1
  const limit = maxUint32 - (maxUint32 % range); // rejection limit

  const buf = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buf);
    const r = buf[0];

    // only use values in [0, limit), reject the rest
    if (r < limit) {
      // map to [0, range-1], then +1 → [1, range]
      return (r % range) + 1;
    }
  }
};

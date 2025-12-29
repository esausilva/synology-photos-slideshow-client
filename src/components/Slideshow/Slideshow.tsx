import { useCallback, useEffect, useState } from 'react';

import styles from './Slideshow.module.css';

interface SlideshowProps {
  slides: string[];
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
      let nextIndex = Math.floor(Math.random() * slides.length);

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

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className={styles.slideshowContainer}>
      <div key={currentIndex} className={styles.slide}>
        <div
          className={styles.background}
          style={{ backgroundImage: `url(${currentSlide})` }}
        />
        <div className={styles.imageContainer}>
          <img
            src={currentSlide}
            alt={`Slide ${currentIndex}`}
            className={styles.mainImage}
          />
        </div>
      </div>

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
    </div>
  );
}

import { IconMapMarker } from '~/components/icons';
import type { Slide } from '~/server-functions';
import styles from './Slideshow.module.css';

interface SlideOverlayProps {
  slide: Slide;
}

export function SlideOverlay({ slide }: SlideOverlayProps) {
  const { dateTaken, location, googleMapsLink } = slide;

  const isValidDate = dateTaken && !Number.isNaN(dateTaken.getTime());

  const formattedDate = isValidDate
    ? dateTaken.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : null;

  const showSeparator = isValidDate && location;

  return (
    <div className={styles.overlay}>
      {formattedDate && <div>{formattedDate}</div>}
      {showSeparator && <span>|</span>}
      {googleMapsLink && (
        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
          {location || <IconMapMarker />}
        </a>
      )}
    </div>
  );
}

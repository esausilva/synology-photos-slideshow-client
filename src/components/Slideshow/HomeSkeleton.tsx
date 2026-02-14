import { useEffect, useState } from 'react';
import styles from './HomeSkeleton.module.css';

export function HomeSkeleton({ delay = 300 }: { delay?: number }) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonSlide}>
        <div className={styles.skeletonBackground} />
        <div className={styles.skeletonImageContainer}>
          <div className={styles.skeletonImage} />
        </div>
        <div className={styles.skeletonOverlay} />
      </div>
    </div>
  );
}

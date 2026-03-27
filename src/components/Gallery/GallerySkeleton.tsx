import { useEffect, useState } from 'react';
import styles from './GallerySkeleton.module.css';

export function GallerySkeleton({ delay = 300 }: { delay?: number }) {
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
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 12 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders with no reordering
        <div key={i} className={styles.skeletonItem} />
      ))}
    </div>
  );
}

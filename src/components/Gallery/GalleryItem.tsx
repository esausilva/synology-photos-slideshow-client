import { IconStar } from '../icons';
import styles from './GalleryItem.module.css';

interface GalleryItemProps {
  thumbnailUrl: string;
  isSelected: boolean;
  onImageClick: () => void;
  onToggleSelect: () => void;
}

const favoritesPath = 'favorites';

export function GalleryItem({
  thumbnailUrl,
  isSelected,
  onImageClick,
  onToggleSelect,
}: GalleryItemProps) {
  return (
    <div className={`${styles.item} ${isSelected ? styles.selected : ''}`}>
      <button
        type="button"
        className={styles.checkbox}
        onClick={onToggleSelect}
        aria-label={`Select thumbnail${isSelected ? ' (selected)' : ''}`}
        aria-pressed={isSelected}
      >
        <div className={isSelected ? styles.checked : styles.unchecked} />
      </button>
      {thumbnailUrl.includes(favoritesPath) && (
        <div className={styles.starOverlay}>
          <IconStar />
        </div>
      )}
      <button
        type="button"
        className={styles.imageButton}
        onClick={onImageClick}
        aria-label="Open photo preview"
      >
        <img
          src={thumbnailUrl}
          alt="Slideshow thumbnail"
          className={styles.thumbnail}
          draggable={false}
        />
      </button>
    </div>
  );
}

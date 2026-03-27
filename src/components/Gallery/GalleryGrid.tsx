import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { showErrorToast } from '~/components/Toast/ErrorToast';
import { API_DELETE_PHOTOS } from '~/constants/routes';
import { httpPostJson } from '~/utils/http';
import { THUMBNAIL_POSTFIX } from './constants';
import styles from './GalleryGrid.module.css';
import { GalleryItem } from './GalleryItem';
import { PhotoModal } from './PhotoModal';

interface GalleryGridProps {
  thumbnails: string[];
  apiBaseUrl: string;
  signalRConnectionId?: string | null;
}

export function GalleryGrid({
  thumbnails,
  apiBaseUrl,
  signalRConnectionId,
}: GalleryGridProps) {
  const [localThumbnails, setLocalThumbnails] = useState<string[]>(thumbnails);
  const [selectedThumbnails, setSelectedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    setLocalThumbnails(thumbnails);

    const latestThumbnails = new Set(thumbnails);
    setSelectedThumbnails((prev) => {
      const next = new Set(
        [...prev].filter((thumbnailUrl) => latestThumbnails.has(thumbnailUrl)),
      );
      return next;
    });
  }, [thumbnails]);

  const isSelectionMode = selectedThumbnails.size > 0;

  const toggleSelection = (thumbnailUrl: string): void => {
    setSelectedThumbnails((prev) => {
      const next = new Set(prev);

      if (next.has(thumbnailUrl)) {
        next.delete(thumbnailUrl);
      } else {
        next.add(thumbnailUrl);
      }

      return next;
    });
  };

  const clearSelection = (): void => {
    setSelectedThumbnails(new Set());
  };

  const handleThumbnailClick = (thumbnailUrl: string): void => {
    const fullSizeUrl = toFullSizeUrl(thumbnailUrl);
    setModalImageUrl(fullSizeUrl);
  };

  const handleDelete = async (): Promise<void> => {
    if (selectedThumbnails.size === 0) return;

    const photoNames = [...selectedThumbnails].flatMap((thumbnailUrl) => {
      const thumbnailName = extractFileName(thumbnailUrl);
      const fullSizeName = toFullSizeName(thumbnailName);
      return [thumbnailName, fullSizeName];
    });

    setIsDeleting(true);

    try {
      const response = await httpPostJson(`${apiBaseUrl}${API_DELETE_PHOTOS}`, {
        photoNames,
        signalRConnectionId,
      });

      if (response.status >= 500) {
        showErrorToast('Failed to delete selected photos.');
        console.error(`API Error (${response.status}): ${response.statusText}`);
        return;
      }

      toast.success(
        `${selectedThumbnails.size} photo${selectedThumbnails.size > 1 ? 's' : ''} deleted.`,
      );

      setLocalThumbnails((prev) =>
        prev.filter((url) => !selectedThumbnails.has(url)),
      );
      clearSelection();
    } catch (error) {
      showErrorToast('Failed to delete photos.');
      console.error('Error deleting photos:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {isSelectionMode && (
        <div className={styles.selectionBar}>
          <span>
            {selectedThumbnails.size} photo
            {selectedThumbnails.size > 1 ? 's' : ''} selected
          </span>
          <div className={styles.selectionActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={clearSelection}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      <p className={styles.photoCount}>
        Total photos in gallery: {localThumbnails.length}
      </p>

      {localThumbnails.length === 0 ? (
        <p className={styles.emptyMessage}>
          No photos in the gallery.
          <br />
          Either the gallery is empty or the thumbnails are being generated.{' '}
          <br />
          If the latter, the Gallery will auto-refresh when thumbnails finish
          generating.
        </p>
      ) : (
        <div className={styles.grid}>
          {localThumbnails.map((thumbnailUrl) => (
            <GalleryItem
              key={thumbnailUrl}
              thumbnailUrl={thumbnailUrl}
              isSelected={selectedThumbnails.has(thumbnailUrl)}
              onImageClick={() => handleThumbnailClick(thumbnailUrl)}
              onToggleSelect={() => toggleSelection(thumbnailUrl)}
            />
          ))}
        </div>
      )}

      {modalImageUrl && (
        <PhotoModal
          imageUrl={modalImageUrl}
          onClose={() => setModalImageUrl(null)}
        />
      )}
    </>
  );
}

function toFullSizeUrl(thumbnailUrl: string): string {
  return thumbnailUrl.replace(`${THUMBNAIL_POSTFIX}.webp`, '.webp');
}

function toFullSizeName(thumbnailName: string): string {
  return thumbnailName.replace(`${THUMBNAIL_POSTFIX}.webp`, '.webp');
}

function extractFileName(url: string): string {
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? '';
  } catch {
    return url.split('/').pop() ?? '';
  }
}

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { showErrorToast } from '~/components/Toast/ErrorToast';
import { API_DELETE_PHOTOS, API_TOGGLE_FAVORITE } from '~/constants/routes';
import { httpPostJson } from '~/utils/http';
import { FAVORITES_FOLDER, THUMBNAIL_POSTFIX } from './constants';
import styles from './GalleryGrid.module.css';
import { GalleryItem } from './GalleryItem';
import { PhotoModal } from './PhotoModal';

interface ToggleFavoriteResponse {
  fileName: string;
}

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

  // Thumbnail URL -> target favorite state, for toggles awaiting the API response
  const [pendingFavorites, setPendingFavorites] = useState<
    Map<string, boolean>
  >(new Map());

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

  const handleToggleFavorite = async (thumbnailUrl: string): Promise<void> => {
    if (pendingFavorites.has(thumbnailUrl)) return;

    const targetIsFavorite = !isFavoriteUrl(thumbnailUrl);

    // Optimistic update of the star only; the image URL changes once the file has moved
    setPendingFavorites((prev) =>
      new Map(prev).set(thumbnailUrl, targetIsFavorite),
    );

    try {
      const response = await httpPostJson(
        `${apiBaseUrl}${API_TOGGLE_FAVORITE}`,
        {
          fileName: toFullSizeName(extractFileName(thumbnailUrl)),
          isFavorite: targetIsFavorite,
          signalRConnectionId,
        },
      );

      if (!response.ok) {
        throw new Error(
          `API Error (${response.status}): ${response.statusText}`,
        );
      }

      const { fileName } = (await response.json()) as ToggleFavoriteResponse;
      const newThumbnailUrl = toMovedThumbnailUrl(
        thumbnailUrl,
        toThumbnailName(fileName),
        targetIsFavorite,
      );

      setLocalThumbnails((prev) =>
        prev.map((url) => (url === thumbnailUrl ? newThumbnailUrl : url)),
      );
      setSelectedThumbnails((prev) => {
        if (!prev.has(thumbnailUrl)) return prev;

        const next = new Set(prev);
        next.delete(thumbnailUrl);
        next.add(newThumbnailUrl);
        return next;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showErrorToast('Failed to toggle favorite.');
    } finally {
      setPendingFavorites((prev) => {
        const next = new Map(prev);
        next.delete(thumbnailUrl);
        return next;
      });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (selectedThumbnails.size === 0) return;

    const photoNames = [...selectedThumbnails].map((thumbnailUrl) => {
      const thumbnailName = extractFileName(thumbnailUrl);
      return toFullSizeName(thumbnailName);
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
              isFavorite={
                pendingFavorites.get(thumbnailUrl) ??
                isFavoriteUrl(thumbnailUrl)
              }
              isFavoritePending={pendingFavorites.has(thumbnailUrl)}
              onToggleFavorite={() => handleToggleFavorite(thumbnailUrl)}
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

function toThumbnailName(fileName: string): string {
  return fileName.replace(/\.webp$/, `${THUMBNAIL_POSTFIX}.webp`);
}

function isFavoriteUrl(url: string): boolean {
  const directory = url.slice(0, url.lastIndexOf('/'));
  return directory.endsWith(`/${FAVORITES_FOLDER}`);
}

function toMovedThumbnailUrl(
  url: string,
  newFileName: string,
  isFavorite: boolean,
): string {
  const directory = url.slice(0, url.lastIndexOf('/'));
  const baseDirectory = isFavoriteUrl(url)
    ? directory.slice(0, -`/${FAVORITES_FOLDER}`.length)
    : directory;

  return isFavorite
    ? `${baseDirectory}/${FAVORITES_FOLDER}/${newFileName}`
    : `${baseDirectory}/${newFileName}`;
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

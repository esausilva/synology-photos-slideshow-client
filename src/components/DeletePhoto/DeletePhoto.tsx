import { toast } from 'react-toastify';
import { IconTrash } from '~/components/icons/IconTrash';
import { showErrorToast } from '~/components/Toast/ErrorToast';
import { API_DELETE_PHOTOS } from '~/constants/routes';
import { useSlideshowMetadata } from '~/contexts/SlideshowMetadataContext';
import { httpPostJson } from '~/utils/http';
import styles from './DeletePhoto.module.css';

interface DeletePhotoProps {
  slide: string;
  deleteSlide: () => void;
}

export function DeletePhoto({ slide, deleteSlide }: DeletePhotoProps) {
  const { apiBaseUrl, signalRConnectionId } = useSlideshowMetadata();

  const handleClick = async (): Promise<void> => {
    const photoName = extractPhotoName(slide) ?? 'no-photo.jpg';

    try {
      const response = await httpPostJson(`${apiBaseUrl}${API_DELETE_PHOTOS}`, {
        photoNames: [photoName],
        signalRConnectionId: signalRConnectionId,
      });

      if (response.status >= 500) {
        showErrorToast('Failed to delete photo.');
        console.error(`API Error (${response.status}): ${response.statusText}`);
        return;
      }

      toast.success('Photo deleted successfully.');
      deleteSlide();
    } catch (error) {
      showErrorToast('Failed to delete photo.');
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={styles.deleteButton}>
      <IconTrash />
    </button>
  );
}

const extractPhotoName = (slideUrl: string): string | null => {
  try {
    const url = new URL(slideUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? null;
  } catch {
    return slideUrl.split('/').pop() ?? null;
  }
};

import { useRouter } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { IconTrash } from '~/components/icons/IconTrash';
import { API_DELETE_PHOTOS } from '~/constants/routes';
import { useApiBaseUrl } from '~/contexts/ApiBaseUrlContext';

import styles from './DeletePhoto.module.css';

interface DeletePhotoProps {
  slide: string;
}

export function DeletePhoto({ slide }: DeletePhotoProps) {
  const router = useRouter();
  const apiBaseUrl = useApiBaseUrl();

  const handleClick = async (): Promise<void> => {
    try {
      const response = await fetch(`${apiBaseUrl}${API_DELETE_PHOTOS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([extractPhotoName(slide) ?? "no-photo.jpg"]),
      });

      if (!response.ok) {
        toast.error('Failed to delete photo.');
        console.error(`API Error (${response.status}): ${response.statusText}`);
        return;
      }

      toast.success('Photo deleted successfully.');
      await router.invalidate();
    } catch (error) {
      toast.error('Failed to delete photo.');
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
    return null;
  }
};

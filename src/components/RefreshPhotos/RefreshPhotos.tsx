import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_DOWNLOAD_PHOTOS } from '~/constants/routes';
import styles from './RefreshPhotos.module.css';

export function RefreshPhotos({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefreshClick = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}${API_DOWNLOAD_PHOTOS}`);

      if (response.status === 204) {
        toast(
          <div>
            Photos have been refreshed.
            <br />
            Enjoy your new slideshow!
          </div>,
        );
      } else if (response.status === 503) {
        toast.error('Unable to download photos due to timeouts.');
        console.error(
          'API Error (503): Unable to download photos due to timeouts.',
        );
      } else {
        toast.error('An unexpected error occurred.');
        console.error(`API Error (${response.status}): ${response.statusText}`);
      }
    } catch (error) {
      toast.error('Failed to refresh photos.');
      console.error('Error refreshing photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type={'button'}
      className={styles.refreshButton}
      onClick={handleRefreshClick}
      disabled={isLoading}
    >
      {isLoading ? 'Refreshing...' : 'Refresh Photos'}
    </button>
  );
}

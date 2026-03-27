import { Await, createFileRoute, defer, Link } from '@tanstack/react-router';
import { Suspense, useEffect } from 'react';
import { GalleryGrid } from '~/components/Gallery/GalleryGrid';
import { GallerySkeleton } from '~/components/Gallery/GallerySkeleton';
import { IconHome } from '~/components/icons';
import { showErrorToast } from '~/components/Toast/ErrorToast';
import { WEB_GALLERY } from '~/constants/routes';
import {
  type UseSlideshowSignalRReturn,
  useSlideshowSignalR,
} from '~/hooks/useSlideshowSignalR';
import styles from '~/routes/styles/gallery.module.css';
import { getApiBaseUrlForClient, getThumbnails } from '~/server-functions';

export const Route = createFileRoute(WEB_GALLERY)({
  component: Gallery,
  loader: async (): Promise<{
    thumbnails: Promise<string[]>;
    apiBaseUrl: string;
    errorMessage: string | null;
  }> => {
    try {
      const apiBaseUrl = await getApiBaseUrlForClient();
      const thumbnailsPromise = getThumbnails();

      return {
        thumbnails: defer(thumbnailsPromise),
        apiBaseUrl,
        errorMessage: null,
      };
    } catch (error) {
      console.error('Error loading thumbnails: ', error);
      return {
        thumbnails: Promise.resolve([]),
        apiBaseUrl: '',
        errorMessage:
          'Error loading gallery. Please verify the Synology Photos Slideshow API is running and accessible.',
      };
    }
  },
});

function Gallery() {
  const { thumbnails, apiBaseUrl, errorMessage } = Route.useLoaderData();

  const { connectionId: signalRConnectionId }: UseSlideshowSignalRReturn =
    useSlideshowSignalR({
      apiBaseUrl,
    });

  useEffect(() => {
    if (errorMessage) {
      showErrorToast(errorMessage);
      console.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gallery</h1>
        <Link
          to="/"
          className={styles.homeLink}
          aria-label="Slideshow Home"
          title="Slideshow Home"
          tabIndex={0}
        >
          <IconHome />
        </Link>
      </header>
      {errorMessage ? (
        <div className={styles.errorContainer}>
          <p>{errorMessage}</p>
        </div>
      ) : (
        <Suspense fallback={<GallerySkeleton delay={500} />}>
          <Await promise={thumbnails}>
            {(thumbnails) => (
              <GalleryGrid
                thumbnails={thumbnails}
                apiBaseUrl={apiBaseUrl}
                signalRConnectionId={signalRConnectionId}
              />
            )}
          </Await>
        </Suspense>
      )}
    </div>
  );
}

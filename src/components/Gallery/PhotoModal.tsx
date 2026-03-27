import type * as React from 'react';
import { useEffect, useRef } from 'react';
import styles from './PhotoModal.module.css';

interface PhotoModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function PhotoModal({ imageUrl, onClose }: PhotoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef<boolean>(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Reset suppression for the active mounted instance.
    isClosingRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      if (!dialog.open) {
        dialog.showModal();
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      // In development Strict Mode, effects are intentionally cleaned up and re-run.
      // Keep this flag set so any close event from cleanup does not propagate to the parent state.
      isClosingRef.current = true;
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const handleNativeClose = (): void => {
    // Ignore close events triggered by cleanup (React Strict Mode unmount simulation)
    if (!isClosingRef.current) {
      onClose();
    }
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDialogElement>,
  ): void => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      onClose={handleNativeClose}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close preview"
        >
          &times;
        </button>
        <img src={imageUrl} alt="Full size preview" className={styles.image} />
      </div>
    </dialog>
  );
}

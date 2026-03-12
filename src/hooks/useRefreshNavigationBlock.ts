import { useBlocker } from '@tanstack/react-router';
import { useEffect } from 'react';

const LEAVE_MESSAGE =
  'Photos are currently being refreshed. Are you sure you want to leave this page?';

export function useRefreshNavigationBlock(isLoading: boolean): void {
  useBlocker({
    shouldBlockFn: () => {
      if (!isLoading) {
        return false;
      }

      return !window.confirm(LEAVE_MESSAGE);
    },
    disabled: !isLoading,
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isLoading) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading]);
}

import { type ToastOptions, toast } from 'react-toastify';

interface ErrorToastProps {
  message: string;
}

export function ErrorToast({ message }: ErrorToastProps) {
  return <span>{message}</span>;
}

const defaultErrorToastOptions = {
  autoClose: false,
} as const satisfies ToastOptions;

export function showErrorToast(message: string, options?: ToastOptions): void {
  toast.error(<ErrorToast message={message} />, {
    ...defaultErrorToastOptions,
    ...options,
  });
}

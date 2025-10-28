/**
 * Utility functions for cleaning up toast notifications
 * This helps prevent toast notifications from interfering with UI interactions
 */

/**
 * Force close all open toast notifications
 * This is useful when closing modals or overlays to prevent UI blocking
 */
export const clearAllToasts = (): void => {
  try {
    const toastElements = document.querySelectorAll('[data-radix-toast-viewport]');
    toastElements.forEach(element => {
      const toasts = element.querySelectorAll('[data-state="open"]');
      toasts.forEach(toast => {
        toast.setAttribute('data-state', 'closed');
        // Also trigger the close animation
        toast.classList.add('animate-out', 'fade-out-80');
      });
    });
  } catch (error) {
    console.warn('Error clearing toasts:', error);
  }
};

/**
 * Clear toasts with a delay to ensure proper cleanup
 * @param delay - Delay in milliseconds before clearing toasts
 */
export const clearToastsWithDelay = (delay: number = 100): void => {
  setTimeout(() => {
    clearAllToasts();
  }, delay);
};

/**
 * Check if there are any open toast notifications
 * @returns boolean indicating if there are open toasts
 */
export const hasOpenToasts = (): boolean => {
  try {
    const toastElements = document.querySelectorAll('[data-radix-toast-viewport]');
    for (const element of toastElements) {
      const openToasts = element.querySelectorAll('[data-state="open"]');
      if (openToasts.length > 0) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('Error checking toast state:', error);
    return false;
  }
};




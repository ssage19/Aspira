import { create } from 'zustand';
import { toast } from 'sonner';

interface NotificationState {
  showNotification: (notification: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }) => void;
}

export const useNotification = create<NotificationState>((set) => ({
  showNotification: ({ title, message, type = 'info', duration = 5000 }) => {
    // Use sonner toast library for notifications
    switch (type) {
      case 'success':
        toast.success(title, {
          description: message,
          duration: duration,
        });
        break;
      case 'error':
        toast.error(title, {
          description: message,
          duration: duration,
        });
        break;
      case 'warning':
        toast.warning(title, {
          description: message,
          duration: duration,
        });
        break;
      default:
        toast.info(title, {
          description: message,
          duration: duration,
        });
        break;
    }
  },
}));
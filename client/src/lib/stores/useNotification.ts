import { create } from 'zustand';
import { toast } from 'sonner';
import React from 'react';

// Define our own ToastOptions type to avoid import issues
type ToastOptions = {
  id?: string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  icon?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export interface Notification {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  options?: ToastOptions;
}

interface NotificationState {
  // A queue of notifications to display
  notificationQueue: Notification[];
  
  // Show a notification
  showNotification: (notification: Notification) => void;
  
  // Show multiple notifications in sequence
  showNotifications: (notifications: Notification[]) => void;
  
  // Clear all notifications
  clearNotifications: () => void;
}

export const useNotification = create<NotificationState>((set, get) => ({
  notificationQueue: [],
  
  showNotification: (notification) => {
    // Set default duration if not provided
    const duration = notification.duration || 5000;
    
    // Use Sonner toast directly - more efficient than queueing
    const toastType = notification.type || 'info';
    const toastOptions = notification.options || {};
    
    // Use the appropriate toast method based on type
    switch (toastType) {
      case 'success':
        toast.success(notification.message, {
          ...toastOptions,
          duration,
          id: `notification-${Date.now()}`,
          description: notification.title,
        });
        break;
      case 'error':
        toast.error(notification.message, {
          ...toastOptions,
          duration,
          id: `notification-${Date.now()}`,
          description: notification.title,
        });
        break;
      case 'warning':
        toast.warning(notification.message, {
          ...toastOptions,
          duration,
          id: `notification-${Date.now()}`,
          description: notification.title,
        });
        break;
      case 'info':
      default:
        toast.info(notification.message, {
          ...toastOptions,
          duration,
          id: `notification-${Date.now()}`,
          description: notification.title,
        });
        break;
    }
    
    // Also store in queue for reference
    set((state) => ({
      notificationQueue: [...state.notificationQueue, notification]
    }));
  },
  
  showNotifications: (notifications) => {
    // Process each notification with a small delay between them
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        get().showNotification(notification);
      }, index * 500); // 500ms delay between notifications
    });
  },
  
  clearNotifications: () => {
    // Clear the notification queue
    set({ notificationQueue: [] });
    
    // Also dismiss all visible toasts
    toast.dismiss();
  }
}));
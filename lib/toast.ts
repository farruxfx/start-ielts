'use client';

// ============================================================
// Toast Notification System
// ============================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

// ============================================================
// Toast State Management
// ============================================================

let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]));
}

function addToast(title: string, message?: string, options?: ToastOptions): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const toast: Toast = {
    id,
    type: options?.type || 'info',
    title,
    message,
    duration: options?.duration || 5000,
  };

  toasts = [...toasts, toast];
  notifyListeners();

  // Auto-remove after duration
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

function clearAllToasts() {
  toasts = [];
  notifyListeners();
}

// ============================================================
// Toast API
// ============================================================

export const toast = {
  success: (title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'success' });
  },
  error: (title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'error' });
  },
  warning: (title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'warning' });
  },
  info: (title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'info' });
  },
  remove: removeToast,
  clear: clearAllToasts,
};

// ============================================================
// React Hook for Toasts
// ============================================================

import { useState, useEffect, useCallback } from 'react';

export function useToasts() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toasts: currentToasts,
    dismiss,
    toast,
  };
}

// ============================================================
// API Error Toast Helper
// ============================================================

export function showToastForError(error: unknown, fallbackMessage = "Xatolik yuz berdi") {
  if (error instanceof Error) {
    toast.error("Xatolik", error.message);
  } else if (typeof error === 'string') {
    toast.error("Xatolik", error);
  } else {
    toast.error("Xatolik", fallbackMessage);
  }
}

export function showToastForSuccess(message: string, details?: string) {
  toast.success("Muvaffaqiyatli", details || message);
}

// ============================================================
// Promise-based Toast
// ============================================================

export async function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string | ((result: T) => string);
    error?: string | ((error: unknown) => string);
  }
): Promise<T> {
  const loadingId = toast.info(messages.loading || "Yuklanmoqda...", undefined, { duration: 0 });

  try {
    const result = await promise;
    toast.remove(loadingId);
    
    const successMsg = typeof messages.success === 'function' 
      ? messages.success(result) 
      : messages.success || "Muvaffaqiyatli bajarildi";
    
    toast.success(successMsg);
    return result;
  } catch (error) {
    toast.remove(loadingId);
    
    const errorMsg = typeof messages.error === 'function'
      ? messages.error(error)
      : messages.error || "Xatolik yuz berdi";
    
    toast.error(errorMsg);
    throw error;
  }
}

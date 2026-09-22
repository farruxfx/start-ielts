'use client';

import { useToasts, type Toast, type ToastType } from '@/lib/toast';
import { X } from 'lucide-react';

// ============================================================
// Toast Icon Component
// ============================================================

function ToastIcon({ type }: { type: ToastType }) {
  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  return <span className="text-lg">{icons[type]}</span>;
}

// ============================================================
// Toast Item Component
// ============================================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors: Record<ToastType, string> = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${bgColors[toast.type]}
        animate-in slide-in-from-right-full fade-in
        max-w-sm w-full
      `}
    >
      <ToastIcon type={toast.type} />
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${textColors[toast.type]}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className={`text-sm mt-1 ${textColors[toast.type]} opacity-80`}>
            {toast.message}
          </p>
        )}
      </div>
      
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================================
// Toast Container Component
// ============================================================

export function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

// ============================================================
// Toast Demo Component (for testing)
// ============================================================

export function ToastDemo() {
  const { toast } = useToasts();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => toast.success("Success!", "Operation completed successfully")}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Success Toast
      </button>
      <button
        onClick={() => toast.error("Error!", "Something went wrong")}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Error Toast
      </button>
      <button
        onClick={() => toast.warning("Warning!", "Please check your input")}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Warning Toast
      </button>
      <button
        onClick={() => toast.info("Info", "Here is some useful information")}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Info Toast
      </button>
    </div>
  );
}

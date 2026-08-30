'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  type Notification,
} from '@/lib/notifications';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (open) {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    }
  }, [open]);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleClear = () => {
    clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!open) return null;

  const typeColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    streak: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    subscription: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    achievement: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="relative mt-16 mr-4 w-full max-w-sm rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
                <CheckCheck className="mr-1 h-3 w-3" /> Read all
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                    !n.read && 'bg-primary/5'
                  )}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs', typeColors[n.type])}>
                    {n.type === 'streak' ? '🔥' : n.type === 'achievement' ? '🏆' : n.type === 'success' ? '✅' : n.type === 'subscription' ? '💳' : 'ℹ️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={handleClear}>
              <Trash2 className="mr-1 h-3 w-3" /> Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

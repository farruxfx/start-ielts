/**
 * In-app notifications system for StartIELTS
 */

export type NotificationType = 'info' | 'warning' | 'success' | 'streak' | 'subscription' | 'achievement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const STORAGE_KEY = 'ieltspro_notifications';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getNotifications(): Notification[] {
  return safeGet<Notification[]>(STORAGE_KEY, []);
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  // Keep only last 50 notifications
  safeSet(STORAGE_KEY, notifications.slice(0, 50));
}

export function markAsRead(id: string): void {
  const notifications = getNotifications();
  const n = notifications.find(n => n.id === id);
  if (n) n.read = true;
  safeSet(STORAGE_KEY, notifications);
}

export function markAllAsRead(): void {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  safeSet(STORAGE_KEY, notifications);
}

export function clearNotifications(): void {
  safeSet(STORAGE_KEY, []);
}

// Predefined notification generators
export function notifyStreak(streakDays: number): void {
  const messages: Record<number, string> = {
    3: "🔥 3 kunlik streak! Davom eting!",
    7: "🔥🔥 7 kunlik streak! Ajoyib!",
    14: "🏆 14 kunlik streak! Siz zo'rsiz!",
    30: "👑 30 kunlik streak! Mutlaqo ajoyib!",
  };
  const title = messages[streakDays] || `🔥 ${streakDays} kunlik streak!`;
  addNotification({
    type: 'streak',
    title,
    message: `Siz ${streakDays} kun ketma-ket mashq qildingiz!`,
  });
}

export function notifySubscriptionExpiry(daysLeft: number, planName: string): void {
  addNotification({
    type: 'subscription',
    title: `${planName} obunasi tugaydi`,
    message: `${daysLeft} kun qoldi. Obunangizni yangilashni unutmang.`,
    actionUrl: '/pricing',
  });
}

export function notifyAchievement(title: string, description: string): void {
  addNotification({
    type: 'achievement',
    title: `🏆 ${title}`,
    message: description,
  });
}

export function notifyGoalComplete(goalName: string): void {
  addNotification({
    type: 'success',
    title: '✅ Kunlik maqsad bajarildi!',
    message: goalName,
  });
}

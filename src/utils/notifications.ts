// ClockDock Phase 3 — Local Notifications Helper

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

export function sendLocalNotification(
  title: string,
  options?: {
    body?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
  }
): boolean {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body || 'ClockDock Bedside Clock',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: options?.tag || 'clockdock-alert',
      requireInteraction: options?.requireInteraction ?? true,
      silent: options?.silent ?? false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch {
    return false;
  }
}

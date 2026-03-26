import { useState, useEffect } from "react";
import { Notification, MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage or use mock data
    const stored = localStorage.getItem("nw-notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem("nw-notifications", JSON.stringify(MOCK_NOTIFICATIONS));
    }
    setLoading(false);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("nw-notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem("nw-notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("nw-notifications", JSON.stringify([]));
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };
}

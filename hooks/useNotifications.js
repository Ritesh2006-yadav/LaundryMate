"use client";

import { useState, useEffect, useCallback } from "react";

// Initial notifications strictly empty for new users (no fake notifications)
const INITIAL_NOTIFICATIONS = [];

let cachedNotifications = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => cachedNotifications || []);

  const loadNotifications = useCallback((force = false) => {
    if (!force && cachedNotifications) {
      setNotifications(cachedNotifications);
      return;
    }
    try {
      const stored = localStorage.getItem("lpu_lms_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedNotifications = parsed;
        setNotifications(parsed);
      } else {
        cachedNotifications = [];
        setNotifications([]);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      cachedNotifications = [];
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleStorage = (e) => {
      if (e.key === "lpu_lms_notifications") {
        loadNotifications(true);
      }
    };
    const handleCustom = () => loadNotifications(true);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lpu_notifications_updated", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lpu_notifications_updated", handleCustom);
    };
  }, [loadNotifications]);

  const saveNotifications = (newList) => {
    cachedNotifications = newList;
    setNotifications(newList);
    try {
      localStorage.setItem("lpu_lms_notifications", JSON.stringify(newList));
      window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  };

  const addNotification = (notif) => {
    const newEntry = {
      id: `notif-${Date.now()}`,
      time: "Just now",
      unread: true,
      ...notif,
    };
    const updated = [newEntry, ...notifications];
    saveNotifications(updated);
    return newEntry;
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}


"use client";

import { useState, useEffect, useCallback } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Order #LMS1054 in Washing",
    desc: "Your laundry clothes are currently being washed at Hub North with hypoallergenic care.",
    time: "10 mins ago",
    type: "order",
    unread: true,
    link: "/student/track-order/LMS1054",
  },
  {
    id: "notif-2",
    title: "Complaint #CMP-901 Under Review",
    desc: "Hub Inspector Rohit Kumar has initiated review on your missing clothes ticket.",
    time: "2 hours ago",
    type: "complaint",
    unread: true,
    link: "/student/complaints",
  },
  {
    id: "notif-3",
    title: "Order #LMS1049 Delivered Successfully",
    desc: "Delivered to GH-3 Block B-31. Please inspect and confirm your garments.",
    time: "02 Nov 2026",
    type: "order",
    unread: false,
    link: "/student/track-order/LMS1049",
  },
];

let cachedNotifications = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => cachedNotifications || INITIAL_NOTIFICATIONS);

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
        cachedNotifications = INITIAL_NOTIFICATIONS;
        localStorage.setItem("lpu_lms_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      cachedNotifications = INITIAL_NOTIFICATIONS;
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


"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_ORDERS } from "@/lib/supabase/mockData";
import { supabase } from "@/lib/supabase/client";

// In-memory module cache for instant client-side transitions without storage read latency
let cachedOrders = null;
let realtimeChannel = null;
let realtimeSubscribers = 0;

export function useLaundryOrders() {
  const [orders, setOrders] = useState(() => cachedOrders || MOCK_ORDERS);
  const [loading, setLoading] = useState(false);

  // Load orders helper
  const loadStoredOrders = useCallback((force = false) => {
    if (!force && cachedOrders) {
      setOrders(cachedOrders);
      return;
    }
    try {
      const stored = localStorage.getItem("lpu_lms_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length < MOCK_ORDERS.length) {
          const existingIds = new Set(parsed.map((o) => o.id));
          const toAdd = MOCK_ORDERS.filter((o) => !existingIds.has(o.id));
          const merged = [...toAdd, ...parsed];
          cachedOrders = merged;
          setOrders(merged);
          localStorage.setItem("lpu_lms_orders", JSON.stringify(merged));
        } else {
          cachedOrders = parsed;
          setOrders(parsed);
        }
      } else {
        cachedOrders = MOCK_ORDERS;
        setOrders(MOCK_ORDERS);
        localStorage.setItem("lpu_lms_orders", JSON.stringify(MOCK_ORDERS));
      }
    } catch (e) {
      console.error("Failed to load orders from storage", e);
      cachedOrders = MOCK_ORDERS;
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredOrders();

    // Listen to inter-tab storage changes
    const handleStorageChange = (e) => {
      if (e.key === "lpu_lms_orders") {
        loadStoredOrders(true);
      }
    };

    // Listen to intra-tab custom updates
    const handleCustomUpdate = () => {
      loadStoredOrders(true);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("lpu_orders_updated", handleCustomUpdate);

    // Shared singleton Supabase Realtime channel (prevents WebSocket churn across navigation)
    if (supabase) {
      realtimeSubscribers++;
      if (!realtimeChannel) {
        realtimeChannel = supabase
          .channel("public:laundry_orders")
          .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
            loadStoredOrders(true);
          })
          .subscribe();
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("lpu_orders_updated", handleCustomUpdate);
      if (supabase) {
        realtimeSubscribers = Math.max(0, realtimeSubscribers - 1);
        if (realtimeSubscribers === 0 && realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
      }
    };
  }, [loadStoredOrders]);

  const saveOrders = (newOrders) => {
    cachedOrders = newOrders;
    setOrders(newOrders);
    try {
      localStorage.setItem("lpu_lms_orders", JSON.stringify(newOrders));
      window.dispatchEvent(new CustomEvent("lpu_orders_updated"));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  };

  const createOrder = (orderData) => {
    const highestNum = orders.reduce((max, ord) => {
      const num = parseInt(ord.id.replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1054);

    const newId = `LMS${highestNum + 1}`;
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDeliveryStr = `${tomorrow.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, 06:00 PM`;

    const newOrder = {
      id: newId,
      requestDate: todayStr,
      requestTime: timeStr,
      expectedDelivery: expectedDeliveryStr,
      status: "Request Placed",
      assignedStaff: {
        name: "Rohit Kumar",
        staffId: "STF-8821",
        phone: "+91 98111 22334",
        role: "Laundry Hub Runner & Operator",
        hub: "Central Laundry Complex - North Wing",
      },
      timeline: [
        {
          status: "Request Placed",
          time: `${todayStr}, ${timeStr}`,
          completed: true,
          current: true,
        },
        { status: "Request Accepted", time: "Pending", completed: false },
        { status: "Clothes Picked Up", time: "Pending", completed: false },
        { status: "In Washing", time: "Pending", completed: false },
        { status: "In Drying", time: "Pending", completed: false },
        { status: "Ironing", time: "Pending", completed: false },
        { status: "Ready for Delivery", time: "Pending", completed: false },
        { status: "Delivered", time: "Pending", completed: false },
      ],
      ...orderData,
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, remarks = "") => {
    const STAGE_ORDER = [
      "Request Placed",
      "Request Accepted",
      "Clothes Picked Up",
      "Picked Up",
      "In Washing",
      "In Process",
      "In Progress",
      "In Drying",
      "Ironing",
      "Ready for Delivery",
      "Delivered",
      "Completed",
    ];

    const targetIdx = STAGE_ORDER.indexOf(newStatus);

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const timeNow = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateNow = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

        const updatedTimeline = ord.timeline.map((step) => {
          const stepIdx = STAGE_ORDER.indexOf(step.status);

          if (step.status === newStatus || (step.status === "Clothes Picked Up" && newStatus === "Picked Up")) {
            return {
              ...step,
              completed: true,
              current: true,
              time: `${dateNow}, ${timeNow}`,
            };
          } else if (stepIdx < targetIdx && stepIdx !== -1) {
            return {
              ...step,
              completed: true,
              current: false,
              time: step.time && step.time !== "Pending" ? step.time : `${dateNow}, ${timeNow}`,
            };
          } else {
            return {
              ...step,
              completed: false,
              current: false,
              time: step.time && step.time !== "Pending" && step.completed ? step.time : "Pending",
            };
          }
        });

        return {
          ...ord,
          status: newStatus,
          remarks: remarks || ord.remarks,
          timeline: updatedTimeline,
          lastUpdated: new Date().toISOString(),
        };
      }
      return ord;
    });

    saveOrders(updated);

    if (typeof window !== "undefined") {
      try {
        const storedNotifs = localStorage.getItem("lpu_lms_notifications");
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `Order #${orderId} is now ${newStatus}`,
          desc: remarks || `Your laundry request status has been updated to ${newStatus}.`,
          time: "Just now",
          type: "order",
          unread: true,
          link: `/student/track-order/${orderId}`,
        };
        localStorage.setItem("lpu_lms_notifications", JSON.stringify([newNotif, ...notifs.slice(0, 19)]));
        window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
      } catch (e) {
        // silent fail
      }
    }
  };

  const cancelOrder = (orderId, reason = "Cancelled by student") => {
    let success = false;
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        if (["Request Placed", "Pending"].includes(ord.status)) {
          success = true;
          return {
            ...ord,
            status: "Cancelled",
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
            timeline: [
              ...ord.timeline.filter((t) => t.completed),
              {
                status: "Cancelled",
                time: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                completed: true,
                current: true,
              },
            ],
          };
        }
      }
      return ord;
    });

    if (success) {
      saveOrders(updated);
    }
    return success;
  };

  const assignStaffToOrder = (orderId, staffMember) => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          assignedStaff: staffMember,
        };
      }
      return ord;
    });
    saveOrders(updated);

    if (typeof window !== "undefined") {
      try {
        const storedNotifs = localStorage.getItem("lpu_lms_notifications");
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `Runner Assigned to Order #${orderId}`,
          desc: `Hub runner ${staffMember.name || "Staff"} (${staffMember.staffId || "STF"}) has been assigned to collect your laundry.`,
          time: "Just now",
          type: "order",
          unread: true,
          link: `/student/track-order/${orderId}`,
        };
        localStorage.setItem("lpu_lms_notifications", JSON.stringify([newNotif, ...notifs.slice(0, 19)]));
        window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
      } catch (e) {
        // silent fail
      }
    }
  };

  const rejectOrderByStaff = (orderId, reason = "Rejected by laundry staff") => {
    const timeNow = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateNow = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: "Rejected",
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          timeline: [
            ...ord.timeline.filter((t) => t.completed),
            {
              status: "Rejected",
              time: `${dateNow}, ${timeNow}`,
              completed: true,
              current: true,
              remarks: reason,
            },
          ],
        };
      }
      return ord;
    });
    saveOrders(updated);

    if (typeof window !== "undefined") {
      try {
        const storedNotifs = localStorage.getItem("lpu_lms_notifications");
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `Order #${orderId} Rejected`,
          desc: reason || `Your laundry request was rejected by hub staff. Any deducted balance has been refunded.`,
          time: "Just now",
          type: "order",
          unread: true,
          link: `/student/my-orders`,
        };
        localStorage.setItem("lpu_lms_notifications", JSON.stringify([newNotif, ...notifs.slice(0, 19)]));
        window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
      } catch (e) {
        // silent fail
      }
    }
  };

  const getOrderById = (orderId) => {
    if (!orderId) return null;
    const normalized = orderId.replace(/^#/, "").trim().toLowerCase();
    return orders.find(
      (o) =>
        o.id.toLowerCase() === normalized ||
        o.id.toLowerCase() === `lms${normalized}`
    );
  };

  const getUserOrders = useCallback(
    (currentUser) => {
      if (!currentUser) return [];
      const regNo = currentUser.regNo?.trim().toUpperCase().replace(/^LPU/, "");
      const email = currentUser.email?.trim().toLowerCase();
      const id = currentUser.id;
      const name = currentUser.name?.trim().toLowerCase();

      return orders.filter((o) => {
        const orderReg = o.studentRegNo?.trim().toUpperCase().replace(/^LPU/, "");
        const orderEmail = o.studentEmail?.trim().toLowerCase();
        const orderId = o.studentId;
        const orderName = o.studentName?.trim().toLowerCase();

        return (
          (regNo && orderReg === regNo) ||
          (email && orderEmail === email) ||
          (id && orderId === id) ||
          (!regNo && name && orderName === name)
        );
      });
    },
    [orders]
  );

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    assignStaffToOrder,
    rejectOrderByStaff,
    getOrderById,
    getUserOrders,
  };
}

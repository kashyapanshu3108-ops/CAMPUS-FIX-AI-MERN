import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Silently ignore - the bell just won't update this cycle.
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    // Light polling so new notifications (e.g. status changes made by an
    // admin in another tab) show up without a full page reload.
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.patch("/notifications/read-all");
    fetchNotifications();
  };

  // NAYA FUNCTION: Frontend par turant list clear karne ke liye
  const clearAll = async () => {
    // 1. UI se turant hata do (taaki user ko fast lage)
    setNotifications([]);
    setUnreadCount(0);
    
    // 2. Backend ko delete karne ki request bhejo
    try {
      await api.delete("/notifications/clear");
    } catch (error) {
      console.error("Error clearing notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      // YAHAN clearAll KO ADD KIYA HAI TAAKI BAAKI FILES USE KAR SAKEIN
      value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
}
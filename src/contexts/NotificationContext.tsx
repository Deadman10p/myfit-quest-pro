import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: { title: string; message: string; type: string }) => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: async () => {},
  markAllRead: async () => {},
  markRead: async () => {},
  refresh: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

const READ_ANN_KEY = "fitai_read_announcements";
const readAnnouncements = (): string[] => {
  try { return JSON.parse(localStorage.getItem(READ_ANN_KEY) ?? "[]"); } catch { return []; }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    const [{ data: rows }, { data: anns }] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60),
      supabase.from("announcements").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(20),
    ]);
    const readIds = readAnnouncements();
    const mapped: Notification[] = (rows ?? []).map((r: any) => ({
      id: r.id, title: r.title, message: r.body ?? "", date: r.created_at, read: r.is_read, type: r.type,
    }));
    const annNotifs: Notification[] = (anns ?? []).map((a: any) => ({
      id: `ann-${a.id}`, title: a.title, message: a.body, date: a.created_at,
      read: readIds.includes(a.id), type: "announcement",
    }));
    setNotifications([...annNotifs, ...mapped].sort((a, b) => +new Date(b.date) - +new Date(a.date)));
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refresh]);

  const addNotification = async (n: { title: string; message: string; type: string }) => {
    if (!user) return;
    await supabase.from("notifications").insert({ user_id: user.id, title: n.title, body: n.message, type: n.type });
    await refresh();
  };

  const markAnnouncementRead = (id: string) => {
    const bare = id.replace(/^ann-/, "");
    const next = Array.from(new Set([...readAnnouncements(), bare]));
    localStorage.setItem(READ_ANN_KEY, JSON.stringify(next));
  };

  const markRead = async (id: string) => {
    if (id.startsWith("ann-")) markAnnouncementRead(id);
    else await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    notifications.filter(n => n.id.startsWith("ann-")).forEach(n => markAnnouncementRead(n.id));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};

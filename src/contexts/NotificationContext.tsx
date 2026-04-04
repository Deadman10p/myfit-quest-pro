import React, { createContext, useContext, useState } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "achievement" | "challenge" | "streak" | "reminder" | "announcement" | "update" | "feedback" | "birthday";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  markRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

const defaultNotifications: Notification[] = [
  { id: "1", title: "Welcome to FitAI! 🎉", message: "Your personalized fitness journey starts now.", date: new Date().toISOString(), read: false, type: "announcement" },
  { id: "2", title: "First Workout Ready 💪", message: "Your AI coach has prepared your first workout plan.", date: new Date().toISOString(), read: false, type: "reminder" },
  { id: "3", title: "Weekly Challenge", message: "Complete 5 workouts this week to earn 500 XP!", date: new Date().toISOString(), read: false, type: "challenge" },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (n: Omit<Notification, "id" | "date" | "read">) => {
    setNotifications(prev => [
      { ...n, id: Date.now().toString(), date: new Date().toISOString(), read: false },
      ...prev,
    ]);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

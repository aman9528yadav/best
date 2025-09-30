

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Notification = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('sutradhaar_notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications) as Notification[];
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch (e) {
        console.error("Failed to load notifications from local storage", e);
    }
  }, []);
  
  useEffect(() => {
    try {
        localStorage.setItem('sutradhaar_notifications', JSON.stringify(notifications));
    } catch (e) {
        console.error("Failed to save notifications to local storage", e);
    }
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);


  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.error("Failed to play notification sound.", e));
  };

  const markAllAsRead = () => {
    setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, 1000); // Delay to allow user to see the badge before it disappears
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  }


  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, removeNotification, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};


"use client";

import { useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useNotifications, Notification } from '@/context/NotificationContext';

type BroadcastMessage = {
    text: string;
    timestamp: string;
};

export function BroadcastListener() {
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');

    const listener = onValue(messageRef, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as BroadcastMessage;
        
        // Check if a notification with this timestamp already exists
        const notificationExists = notifications.some(n => n.timestamp === message.timestamp);

        if (!notificationExists) {
          addNotification({
            title: 'Broadcast',
            body: message.text,
            timestamp: message.timestamp,
            read: false,
          });
        }
      }
    });

    return () => {
      off(messageRef, 'value', listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNotification]);

  return null; 
}

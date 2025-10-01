
"use client";

import { useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useNotifications } from '@/context/NotificationContext';

type BroadcastMessage = {
    text: string;
    timestamp: string;
};

export function BroadcastListener() {
  const { addNotification, notifications, clearAllNotifications } = useNotifications();

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');

    const listener = onValue(messageRef, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as BroadcastMessage;
        
        // Check if a notification with this exact timestamp already exists.
        const alreadyExists = notifications.some(n => n.timestamp === message.timestamp);

        if (message && message.timestamp && !alreadyExists) {
          addNotification({
            title: 'Broadcast',
            body: message.text,
            timestamp: message.timestamp,
            read: false,
          });
        }
      } else {
        // If the message is cleared from the database, clear the notifications.
        clearAllNotifications();
      }
    });

    // Cleanup function to remove the listener when the component unmounts.
    return () => {
      off(messageRef, 'value', listener);
    };
  }, [addNotification, notifications, clearAllNotifications]);

  return null; 
}

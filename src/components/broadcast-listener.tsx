
"use client";

import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useNotifications, Notification } from '@/context/NotificationContext';

type BroadcastMessage = {
    text: string;
    timestamp: string;
};

export function BroadcastListener() {
  const { addNotification, notifications } = useNotifications();
  const processedTimestamps = useRef(new Set());

  useEffect(() => {
    notifications.forEach(n => processedTimestamps.current.add(n.timestamp));
  }, [notifications]);

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');

    const listener = onValue(messageRef, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as BroadcastMessage;
        
        if (message && message.timestamp && !processedTimestamps.current.has(message.timestamp)) {
          processedTimestamps.current.add(message.timestamp);
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
  }, [addNotification]);

  return null; 
}

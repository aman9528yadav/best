
"use client";

import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useNotifications } from '@/context/NotificationContext';

type BroadcastMessage = {
    text: string;
    timestamp: string;
};

export function BroadcastListener() {
  const { addNotification } = useNotifications();
  const lastProcessedTimestamp = useRef<string | null>(null);

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');

    const listener = onValue(messageRef, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as BroadcastMessage;
        
        if (message.timestamp !== lastProcessedTimestamp.current) {
          lastProcessedTimestamp.current = message.timestamp;
          addNotification({
            id: message.timestamp,
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

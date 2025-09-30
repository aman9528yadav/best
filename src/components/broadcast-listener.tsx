
"use client";

import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Megaphone } from 'lucide-react';

type BroadcastMessage = {
    text: string;
    timestamp: string;
};

export function BroadcastListener() {
  const { toast } = useToast();
  const lastShownTimestamp = useRef<string | null>(null);

  useEffect(() => {
    const messageRef = ref(rtdb, 'broadcast/message');

    const listener = onValue(messageRef, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as BroadcastMessage;
        
        // Only show the toast if it's a new message
        if (message.timestamp !== lastShownTimestamp.current) {
          lastShownTimestamp.current = message.timestamp;
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                <span>Broadcast</span>
              </div>
            ),
            description: message.text,
            duration: 10000,
          });
        }
      }
    });

    // Detach the listener when the component unmounts
    return () => {
      off(messageRef, 'value', listener);
    };
  }, [toast]);

  return null; // This component does not render anything
}

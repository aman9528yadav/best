
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { quickAccessItems } from '@/app/page';
import { cn } from '@/lib/utils';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

export default function ManageQuickAccessPage() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true) }, []);


  const initialItems = profile.quickAccessOrder || quickAccessItems.map(item => ({ id: item.id, hidden: false }));
  
  const [managedItems, setManagedItems] = useState(initialItems);

  useEffect(() => {
    // Sync with profile context if it changes
    setManagedItems(profile.quickAccessOrder || quickAccessItems.map(item => ({ id: item.id, hidden: false })));
  }, [profile.quickAccessOrder]);
  

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(managedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setManagedItems(items);
  };

  const toggleVisibility = (id: string) => {
    setManagedItems(
      managedItems.map(item =>
        item.id === id ? { ...item, hidden: !item.hidden } : item
      )
    );
  };

  const handleSaveChanges = () => {
    setProfile(p => ({ ...p, quickAccessOrder: managedItems }));
    router.back();
  };
  
  const itemMap = new Map(quickAccessItems.map(item => [item.id, item]));

  if (!isClient) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground p-4">
        <div className="w-full max-w-[412px]">
            {/* Skeleton or loading state */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="flex items-center justify-between gap-4 mb-6 pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Manage Quick Access</h1>
            </div>
          </div>
          <Button size="sm" onClick={handleSaveChanges}>Save</Button>
        </div>

        <main className="flex-1 space-y-4 pb-12">
            <p className="text-muted-foreground text-sm">Drag and drop to reorder items. Use the eye icon to show or hide items from your dashboard.</p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="quick-access-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {managedItems.map((orderItem, index) => {
                    const itemDetails = itemMap.get(orderItem.id);
                    if (!itemDetails) return null;
                    const { icon: Icon, label } = itemDetails;

                    return (
                      <Draggable key={orderItem.id} draggableId={orderItem.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn("p-2", snapshot.isDragging && "shadow-lg", orderItem.hidden && "opacity-50")}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <div className="p-2 bg-accent rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-medium flex-1">{label}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleVisibility(orderItem.id)}
                              >
                                {orderItem.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>
      </div>
    </div>
  );
}

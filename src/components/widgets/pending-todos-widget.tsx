
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, ChevronRight, Flag } from 'lucide-react';
import { useProfile, TodoItem } from '@/context/ProfileContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
};


export function PendingTodosWidget() {
    const { profile, toggleTodo } = useProfile();

    const pendingTodos = useMemo(() => {
        if (!profile.todos) return [];
        return profile.todos
            .filter(todo => !todo.completed)
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .slice(0, 3);
    }, [profile.todos]);
    
    const overdueCount = useMemo(() => {
        if (!profile.todos) return 0;
        return profile.todos.filter(t => !t.completed && t.targetDate && new Date(t.targetDate) < new Date()).length;
    }, [profile.todos]);

    if (pendingTodos.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <span>Pending Todos</span>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">You're all caught up!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium flex items-center justify-between">
                    <span>Pending Todos</span>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {overdueCount > 0 && (
                    <p className="text-xs text-destructive font-medium text-center">You have {overdueCount} overdue task(s).</p>
                )}
                {pendingTodos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3">
                        <Checkbox id={`widget-todo-${todo.id}`} onCheckedChange={() => toggleTodo(todo.id)} />
                        <label htmlFor={`widget-todo-${todo.id}`} className="text-sm flex-1">{todo.text}</label>
                        <Flag className={cn("h-4 w-4", priorityColors[todo.priority])} />
                    </div>
                ))}
                 <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href="/todo">
                        View All Todos <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

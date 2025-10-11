

"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, Edit, Save, X, Flag, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { useProfile, TodoItem } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isToday, isFuture, isPast } from 'date-fns';

const StatCard = ({ title, count }: { title: string; count: number }) => (
  <Card>
    <CardContent className="p-3 text-center">
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs text-muted-foreground">{title}</p>
    </CardContent>
  </Card>
);

const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
};

const AddTodo = ({ onAdd }: { onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'completed'>) => void }) => {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState<TodoItem['priority']>('medium');
    const [targetDate, setTargetDate] = useState<Date | undefined>();
    const [recurring, setRecurring] = useState<TodoItem['recurring']>('none');

    const handleAdd = () => {
        if (text.trim()) {
            onAdd({
                text,
                priority,
                targetDate: targetDate?.toISOString(),
                recurring,
            });
            setText('');
            setTargetDate(undefined);
            setPriority('medium');
            setRecurring('none');
        }
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                 <div className="flex gap-2">
                    <Input
                        placeholder="Add a new todo..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("gap-2", targetDate && "text-primary")}>
                                <CalendarIcon className="h-4 w-4" />
                                {targetDate ? format(targetDate, 'MMM d') : 'Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm" className={cn("gap-2", recurring !== 'none' && "text-primary")}>
                                <Repeat className="h-4 w-4" />
                                <span>Recurrence</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={recurring} onValueChange={(p) => setRecurring(p as TodoItem['recurring'])}>
                                <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="weekly">Weekly</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="monthly">Monthly</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm" className="gap-2">
                                <Flag className={cn("h-4 w-4", priorityColors[priority])} />
                                <span>Priority</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={priority} onValueChange={(p) => setPriority(p as TodoItem['priority'])}>
                                <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}

export function TodoPage() {
  const { profile, addTodo, toggleTodo, deleteTodo, updateTodo } = useProfile();
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  
  const todos = profile.todos || [];

  const handleAddTodo = (newTodoData: Omit<TodoItem, 'id' | 'createdAt' | 'completed'>) => {
    addTodo({ ...newTodoData, completed: false });
  };
  
  const handleSaveEdit = (updatedTodo: TodoItem) => {
    updateTodo(updatedTodo);
    setEditingTodo(null);
  };
  
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const groupedTodos = useMemo(() => {
    const today: TodoItem[] = [];
    const upcoming: TodoItem[] = [];
    const overdue: TodoItem[] = [];
    const completed: TodoItem[] = [];

    todos.forEach(todo => {
        if(todo.completed) {
            completed.push(todo);
        } else if (todo.targetDate) {
            const date = new Date(todo.targetDate);
            if (isToday(date)) today.push(todo);
            else if (isFuture(date)) upcoming.push(todo);
            else if (isPast(date)) overdue.push(todo);
            else upcoming.push(todo);
        } else {
            upcoming.push(todo);
        }
    });

    return { today, upcoming, overdue, completed };
  }, [todos]);

  const totalCount = todos.length;
  const completedCount = groupedTodos.completed.length;
  const pendingCount = totalCount - completedCount;

  const TodoListItem = ({ todo }: { todo: TodoItem }) => {
    const isEditing = editingTodo?.id === todo.id;

    if (isEditing) {
        return <EditTodoItem todo={editingTodo!} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-3 p-3"
      >
        <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => toggleTodo(todo.id)}
            className="mt-1"
        />
        <div className="flex-1">
            <label
                htmlFor={`todo-${todo.id}`}
                className={cn(
                    'text-sm cursor-pointer',
                    todo.completed && 'line-through text-muted-foreground'
                )}
            >
                {todo.text}
            </label>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {todo.targetDate && (
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(todo.targetDate), 'MMM d')}
                    </div>
                )}
                {todo.recurring !== 'none' && (
                    <div className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        <span>{todo.recurring}</span>
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center ml-auto opacity-100 transition-opacity">
            <Flag className={cn("h-4 w-4 mr-2", priorityColors[todo.priority])} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTodo(todo)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTodo(todo.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </motion.div>
    );
  };
  
  const EditTodoItem = ({ todo, onSave, onCancel }: { todo: TodoItem, onSave: (todo: TodoItem) => void, onCancel: () => void }) => {
    const [editedTodo, setEditedTodo] = useState(todo);
    return (
       <motion.div layout className="p-3 border rounded-lg bg-accent/50 space-y-3">
         <Input value={editedTodo.text} onChange={(e) => setEditedTodo({...editedTodo, text: e.target.value})} />
         <div className="flex items-center justify-end gap-2">
            {/* Add inputs for date, priority, recurring here */}
            <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4"/></Button>
            <Button size="sm" onClick={() => onSave(editedTodo)}><Save className="h-4 w-4"/></Button>
         </div>
       </motion.div>
    );
  };

  const TodoSection = ({ title, todos }: { title: string, todos: TodoItem[] }) => {
    if (todos.length === 0) return null;
    return (
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-muted-foreground px-3 mt-4">{title}</h3>
        <AnimatePresence>
          {todos.map(todo => <TodoListItem key={todo.id} todo={todo} />)}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold">My Todos</h1>
        <p className="text-muted-foreground">Stay organized and productive.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total" count={totalCount} />
        <StatCard title="Completed" count={completedCount} />
        <StatCard title="Pending" count={pendingCount} />
      </div>

      <AddTodo onAdd={handleAddTodo} />
      
      <Card>
        <CardContent className="p-2">
            {todos.length === 0 ? (
                 <div className="text-center p-8 text-muted-foreground">
                    Your todo list is empty. Add a task to get started!
                </div>
            ) : (
                <>
                    <TodoSection title="Overdue" todos={groupedTodos.overdue} />
                    <TodoSection title="Today" todos={groupedTodos.today} />
                    <TodoSection title="Upcoming" todos={groupedTodos.upcoming} />
                    <TodoSection title="Completed" todos={groupedTodos.completed} />
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useProfile, TodoItem } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, count }: { title: string; count: number }) => (
  <Card>
    <CardContent className="p-3 text-center">
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs text-muted-foreground">{title}</p>
    </CardContent>
  </Card>
);

export function TodoPage() {
  const { profile, addTodo, toggleTodo, deleteTodo, updateTodo } = useProfile();
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editingText, setEditingText] = useState('');

  const todos = profile.todos || [];

  const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos]);
  const pendingCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
  const totalCount = todos.length;

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo({ text: newTodoText.trim(), completed: false });
      setNewTodoText('');
    }
  };
  
  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditingText(todo.text);
  };
  
  const handleSaveEdit = () => {
    if (editingTodo && editingText.trim()) {
      updateTodo({ ...editingTodo, text: editingText.trim() });
      setEditingTodo(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditingText('');
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

      <div className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <Button onClick={handleAddTodo}><Plus className="h-4 w-4" /></Button>
      </div>
      
      <Card>
        <CardContent className="p-2">
            <AnimatePresence>
              {todos.map(todo => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 group"
                >
                    <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                    />
                     {editingTodo?.id === todo.id ? (
                        <Input 
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="flex-1 h-8"
                        />
                     ) : (
                        <label
                            htmlFor={`todo-${todo.id}`}
                            className={cn(
                                'flex-1 text-sm cursor-pointer',
                                todo.completed && 'line-through text-muted-foreground'
                            )}
                        >
                            {todo.text}
                        </label>
                     )}
                     
                    <div className="flex items-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingTodo?.id === todo.id ? (
                            <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}><Save className="h-4 w-4 text-primary" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(todo)}><Edit className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTodo(todo.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {todos.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    Your todo list is empty. Add a task to get started!
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

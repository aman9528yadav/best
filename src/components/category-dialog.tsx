

"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/context/ProfileContext';
import { Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Icon, Briefcase, Coins, Home, Car, School } from 'lucide-react';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: Category | Omit<Category, 'id'>) => void;
  category?: Category;
}

const iconOptions: { name: string; icon: Icon }[] = [
    { name: 'Utensils', icon: Utensils },
    { name: 'Bus', icon: Bus },
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'FileText', icon: FileText },
    { name: 'HeartPulse', icon: HeartPulse },
    { name: 'Ticket', icon: Ticket },
    { name: 'Landmark', icon: Landmark },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Coins', icon: Coins },
    { name: 'Home', icon: Home },
    { name: 'Car', icon: Car },
    { name: 'School', icon: School },
];

export function CategoryDialog({ open, onOpenChange, onSave, category }: CategoryDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
    } else {
      setName('');
      setIcon('Utensils');
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name || !icon) {
      toast({ title: 'All fields are required.', variant: 'destructive' });
      return;
    }
    const categoryData = { name, icon };
    if (category) {
      onSave({ ...categoryData, id: category.id });
    } else {
      onSave(categoryData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit' : 'Add'} Category</DialogTitle>
          <DialogDescription>
            Organize your transactions with custom categories.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Groceries" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-icon">Icon</Label>
             <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                    {iconOptions.map(({ name, icon: IconComponent }) => (
                        <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

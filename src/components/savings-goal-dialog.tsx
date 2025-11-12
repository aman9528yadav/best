

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { SavingsGoal } from '@/context/ProfileContext';
import { formatIndianNumber } from '@/lib/utils';

interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: SavingsGoal | Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  goal?: SavingsGoal;
}

export function SavingsGoalDialog({ open, onOpenChange, onSave, goal }: SavingsGoalDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
    } else {
      setName('');
      setTargetAmount('');
    }
  }, [goal, open]);

  const handleSave = () => {
    if (!name || !targetAmount) {
      toast({ title: 'All fields are required.', variant: 'destructive' });
      return;
    }
    const goalData = {
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: goal?.currentAmount || 0,
    };
    if (goal) {
      onSave({ ...goalData, id: goal.id });
    } else {
      onSave(goalData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit' : 'Add'} Savings Goal</DialogTitle>
          <DialogDescription>
            Set a target for your savings and track your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Vacation Fund" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target Amount</Label>
            <Input id="goal-target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

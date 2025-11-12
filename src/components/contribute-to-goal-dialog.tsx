

"use client";

import React, { useState } from 'react';
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
import type { Account } from '@/context/ProfileContext';
import { formatIndianNumber } from '@/lib/utils';

interface ContributeToGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContribute: (amount: number, accountId: string) => void;
  accounts: Account[];
  goalName: string;
}

export function ContributeToGoalDialog({
  open,
  onOpenChange,
  onContribute,
  accounts,
  goalName
}: ContributeToGoalDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');

  const handleContribute = () => {
    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0) {
      toast({ title: 'Invalid amount.', variant: 'destructive' });
      return;
    }
    if (!accountId) {
        toast({ title: 'Please select an account.', variant: 'destructive' });
        return;
    }
    onContribute(contributionAmount, accountId);
    onOpenChange(false);
    setAmount('');
    setAccountId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contribute to "{goalName}"</DialogTitle>
          <DialogDescription>
            Add funds to your savings goal from one of your accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contribution-amount">Amount</Label>
            <Input id="contribution-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-account">From Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger>
                <SelectContent>
                    {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name} (Balance: ₹{formatIndianNumber(acc.balance)})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleContribute}>Contribute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

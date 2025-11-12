
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
import type { Account } from '@/context/ProfileContext';
import { ArrowRightLeft } from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
  accounts: Account[];
}

export function TransferDialog({
  open,
  onOpenChange,
  onTransfer,
  accounts,
}: TransferDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setFromAccountId('');
      setToAccountId('');
    }
  }, [open]);

  const handleTransfer = () => {
    if (!amount || !fromAccountId || !toAccountId) {
      toast({ title: 'Missing fields', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    if (fromAccountId === toAccountId) {
      toast({ title: 'Invalid transfer', description: 'Cannot transfer to the same account.', variant: 'destructive' });
      return;
    }

    onTransfer(fromAccountId, toAccountId, parseFloat(amount));
    toast({ title: 'Transfer Successful!' });
    onOpenChange(false);
  };

  const availableToAccounts = accounts.filter(acc => acc.id !== fromAccountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
          <DialogDescription>
            Move funds from one of your accounts to another.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="from-account">From</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                      {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name} (₹{formatIndianNumber(acc.balance)})</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="self-end pb-2">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="to-account">To</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                        {availableToAccounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name} (₹{formatIndianNumber(acc.balance)})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleTransfer}>Transfer Funds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

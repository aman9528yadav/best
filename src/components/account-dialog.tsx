
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
import type { Account } from '@/context/ProfileContext';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: Account | Omit<Account, 'id'>) => void;
  account?: Account;
}

export function AccountDialog({ open, onOpenChange, onSave, account }: AccountDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(String(account.balance));
    } else {
      setName('');
      setBalance('0');
    }
  }, [account, open]);

  const handleSave = () => {
    if (!name) {
      toast({ title: 'Account name is required.', variant: 'destructive' });
      return;
    }
    const accountData = {
      name,
      balance: parseFloat(balance) || 0,
    };
    if (account) {
      onSave({ ...accountData, id: account.id });
    } else {
      onSave(accountData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit' : 'Add'} Account</DialogTitle>
          <DialogDescription>
            Manage your financial accounts like bank, cash, or credit cards.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Savings Account" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-balance">Current Balance</Label>
            <Input id="account-balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

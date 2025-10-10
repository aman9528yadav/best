

"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Account, Category, Transaction } from '@/context/ProfileContext';
import { Repeat } from 'lucide-react';

interface BudgetTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Transaction | Omit<Transaction, 'id'>) => void;
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
}

export function BudgetTransactionDialog({
  open,
  onOpenChange,
  onSave,
  transaction,
  accounts,
  categories,
}: BudgetTransactionDialogProps) {
  const { toast } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState<Transaction['recurring']>('none');
  
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId);
      setAccountId(transaction.accountId);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setRecurring(transaction.recurring || 'none');
    } else {
      resetForm();
    }
  }, [transaction, open]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setAccountId(accounts[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setRecurring('none');
  };

  const handleSave = () => {
    if (!amount || !description || !categoryId || !accountId) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }
    
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      accountId,
      date,
      recurring,
    };
    
    if (transaction) {
      onSave({ ...transactionData, id: transaction.id });
    } else {
      onSave(transactionData);
    }
    
    toast({ title: `Transaction ${transaction ? 'Updated' : 'Saved'}!` });
    onOpenChange(false);
  };
  
  const availableCategories = type === 'income' 
    ? categories.filter(c => c.id === 'cat-income') 
    : categories.filter(c => c.id !== 'cat-income');
    
  // Ensure categoryId is valid when type changes
  useEffect(() => {
    if (!availableCategories.some(c => c.id === categoryId)) {
        setCategoryId(availableCategories[0]?.id || '');
    }
  }, [type, categoryId, availableCategories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit' : 'New'} Transaction</DialogTitle>
        </DialogHeader>
        <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Coffee" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {availableCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger>
                    <SelectContent>
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="recurring">Recurrence</Label>
                <Select value={recurring} onValueChange={(v) => setRecurring(v as Transaction['recurring'])}>
                    <SelectTrigger><div className="flex items-center gap-2"><Repeat className="h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Select recurrence" /></div></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

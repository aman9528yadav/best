
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { Account, Category, Transaction } from '@/context/ProfileContext';
import { TrendingDown, TrendingUp, CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface BudgetTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Transaction | Omit<Transaction, 'id'>) => void;
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  onAddCategory: () => void;
}

export function BudgetTransactionDialog({
  open,
  onOpenChange,
  onSave,
  transaction,
  accounts,
  categories,
  onAddCategory,
}: BudgetTransactionDialogProps) {
  const { toast } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId);
      setAccountId(transaction.accountId);
      setDate(transaction.date ? parseISO(transaction.date) : new Date());
      setNotes(transaction.notes || '');
      setTags(transaction.tags || []);
    } else {
      resetForm();
    }
  }, [transaction, open, accounts]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setAccountId(accounts[0]?.id || '');
    setDate(new Date());
    setType('expense');
    setNotes('');
    setTags([]);
  };

  const handleSave = () => {
    if (!amount || !description || !categoryId || !accountId || !date) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }
    
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      accountId,
      date: date.toISOString(),
      notes,
      tags,
    };
    
    if (transaction) {
      onSave({ ...transactionData, id: transaction.id });
    } else {
      onSave(transactionData);
    }
    
    toast({ title: `Transaction ${transaction ? 'Updated' : 'Saved'}!` });
    onOpenChange(false);
  };
  
  const availableCategories = useMemo(() => {
    return type === 'income' 
      ? categories.filter(c => c.id === 'cat-income') 
      : categories.filter(c => c.id !== 'cat-income');
  }, [type, categories]);
    
  // Ensure categoryId is valid when type changes
  useEffect(() => {
    if (!availableCategories.some(c => c.id === categoryId)) {
        setCategoryId('');
    }
  }, [type, categoryId, availableCategories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a new income or expense transaction</DialogDescription>
        </DialogHeader>
        
        <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense"><TrendingDown className="h-4 w-4 mr-2"/>Expense</TabsTrigger>
                <TabsTrigger value="income"><TrendingUp className="h-4 w-4 mr-2"/>Income</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="pl-7" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={'outline'}
                            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'dd-MM-yyyy') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Grocery shopping, Gas station, Restaurant" />
            </div>

            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="category">Category</Label>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onAddCategory}>
                        <Plus className="h-3.5 w-3.5"/>Add New
                    </Button>
                 </div>
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
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any additional notes..." />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input id="tags" value={tags.join(', ')} onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))} placeholder="e.g., business, travel, urgent (comma separated)" />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Add Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

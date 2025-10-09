

"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ArrowUp, ArrowDown, Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Icon, Edit, Trash2, Settings, Wallet, PiggyBank } from 'lucide-react';
import { useProfile, Transaction, Account, Category } from '@/context/ProfileContext';
import { format } from 'date-fns';
import { BudgetTransactionDialog } from './budget-transaction-dialog';
import { AccountDialog } from './account-dialog';
import { CategoryDialog } from './category-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap: { [key: string]: Icon } = {
    Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket
};

const TransactionItem = ({ transaction, categoryName, categoryIcon, onEdit, onDelete }: { transaction: Transaction, categoryName: string, categoryIcon: Icon, onEdit: () => void, onDelete: () => void }) => {
  const isIncome = transaction.type === 'income';
  const CategoryIcon = categoryIcon;

  return (
    <div className="flex items-center gap-4 py-3 group">
      <div className="p-3 bg-accent rounded-full">
        <CategoryIcon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{transaction.description}</p>
        <p className="text-sm text-muted-foreground">{categoryName}</p>
      </div>
      <div className={`text-lg font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}₹{transaction.amount.toFixed(2)}
      </div>
       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
       </div>
    </div>
  );
};

export function BudgetTrackerPage() {
  const { profile, addTransaction, updateTransaction, deleteTransaction, addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory } = useProfile();
  const { accounts, transactions, categories } = profile.budget;
  
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'transaction' | 'account' | 'category' } | null>(null);

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);
  
  const spendingByCategory = useMemo(() => {
    const spending: { [key: string]: { name: string; icon: Icon; total: number } } = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            const category = categoryMap.get(t.categoryId);
            if(category) {
                if(!spending[category.id]) {
                    spending[category.id] = { name: category.name, icon: iconMap[category.icon] || Utensils, total: 0 };
                }
                spending[category.id].total += t.amount;
            }
        }
    });
    return Object.values(spending).sort((a,b) => b.total - a.total);
  }, [transactions, categoryMap]);

  const handleSaveTransaction = (transaction: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in transaction) {
      updateTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'transaction') deleteTransaction(itemToDelete.id);
    if (itemToDelete.type === 'account') deleteAccount(itemToDelete.id);
    if (itemToDelete.type === 'category') deleteCategory(itemToDelete.id);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <Card className="bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground">
        <CardContent className="p-6">
          <div className="text-sm text-primary-foreground/80">Total Balance</div>
          <div className="text-4xl font-bold">₹{totalBalance.toFixed(2)}</div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-300" />
              <div>
                <div className="text-xs">Expenses</div>
                <div className="font-semibold">₹{totalExpenses.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-300" />
              <div>
                <div className="text-xs">Income</div>
                <div className="font-semibold">₹{totalIncome.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => { setEditingTransaction(undefined); setIsTxDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
            {recentTransactions.length > 0 ? (
                recentTransactions.map(t => {
                    const category = categoryMap.get(t.categoryId);
                    return (
                        <TransactionItem 
                            key={t.id}
                            transaction={t}
                            categoryName={category?.name || 'Uncategorized'}
                            categoryIcon={iconMap[category?.icon || ''] || Utensils}
                            onEdit={() => { setEditingTransaction(t); setIsTxDialogOpen(true); }}
                            onDelete={() => setItemToDelete({ id: t.id, type: 'transaction'})}
                        />
                    )
                })
            ) : (
                <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Accounts</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setEditingAccount(undefined); setIsAccountDialogOpen(true); }}><Plus className="h-4 w-4"/>Add</Button>
        </CardHeader>
        <CardContent>
             {accounts.map(acc => (
                <div key={acc.id} className="flex items-center gap-4 py-2 group">
                    <div className="p-2 bg-accent rounded-full"><Wallet className="h-4 w-4 text-primary"/></div>
                    <div className="flex-1 font-medium">{acc.name}</div>
                    <div className="font-semibold">₹{acc.balance.toFixed(2)}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAccount(acc); setIsAccountDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    </div>
                </div>
             ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spending Categories</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setEditingCategory(undefined); setIsCategoryDialogOpen(true); }}><Plus className="h-4 w-4"/>Add</Button>
        </CardHeader>
        <CardContent>
             {categories.filter(c => c.id !== 'cat-income').map(cat => {
                const CategoryIcon = iconMap[cat.icon] || Utensils;
                return (
                    <div key={cat.id} className="flex items-center gap-4 py-2 group">
                        <div className="p-2 bg-accent rounded-full"><CategoryIcon className="h-4 w-4 text-primary"/></div>
                        <div className="flex-1 font-medium">{cat.name}</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(cat); setIsCategoryDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )
             })}
        </CardContent>
      </Card>

      <BudgetTransactionDialog
        open={isTxDialogOpen}
        onOpenChange={setIsTxDialogOpen}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
      />
      <AccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
        onSave={editingAccount ? updateAccount : addAccount}
        account={editingAccount}
      />
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSave={editingCategory ? updateCategory : addCategory}
        category={editingCategory}
      />
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone and will permanently delete this item.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

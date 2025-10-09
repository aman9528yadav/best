
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ArrowUp, ArrowDown, Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Icon } from 'lucide-react';
import { useProfile, Transaction } from '@/context/ProfileContext';
import { format } from 'date-fns';
import { BudgetTransactionDialog } from './budget-transaction-dialog';

const iconMap: { [key: string]: Icon } = {
    Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket
};

const TransactionItem = ({ transaction, categoryName, categoryIcon }: { transaction: Transaction, categoryName: string, categoryIcon: Icon }) => {
  const isIncome = transaction.type === 'income';
  const CategoryIcon = categoryIcon;

  return (
    <div className="flex items-center gap-4 py-3">
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
    </div>
  );
};

export function BudgetTrackerPage() {
  const { profile, addTransaction } = useProfile();
  const { accounts, transactions, categories } = profile.budget;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
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
                        />
                    )
                })
            ) : (
                <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
             {spendingByCategory.length > 0 ? (
                spendingByCategory.map(cat => {
                    const CategoryIcon = cat.icon;
                    return (
                         <div key={cat.name} className="flex items-center gap-4 py-2">
                            <div className="p-2 bg-accent rounded-full"><CategoryIcon className="h-4 w-4 text-primary"/></div>
                            <div className="flex-1 font-medium">{cat.name}</div>
                            <div className="font-semibold">₹{cat.total.toFixed(2)}</div>
                        </div>
                    )
                })
             ) : (
                <p className="text-muted-foreground text-center py-8">No expenses tracked yet.</p>
             )}
        </CardContent>
      </Card>

      <BudgetTransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={addTransaction}
        accounts={accounts}
        categories={categories.filter(c => c.id !== 'cat-income')}
      />
    </div>
  );
}

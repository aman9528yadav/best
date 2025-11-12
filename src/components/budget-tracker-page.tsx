

"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ArrowUp, ArrowDown, Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Icon, Edit, Trash2, Settings, Wallet, PiggyBank, Briefcase, Coins, Home, Car, Filter, Target, Gem, School, LineChart, Repeat, ArrowRightLeft } from 'lucide-react';
import { useProfile, Transaction, Account, Category, SavingsGoal } from '@/context/ProfileContext';
import { format, parseISO, isSameMonth, subMonths, startOfMonth, formatDistanceToNow } from 'date-fns';
import { BudgetTransactionDialog } from './budget-transaction-dialog';
import { AccountDialog } from './account-dialog';
import { CategoryDialog } from './category-dialog';
import { SavingsGoalDialog } from './savings-goal-dialog';
import { ContributeToGoalDialog } from './contribute-to-goal-dialog';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BudgetBreakdownChart } from './budget-breakdown-chart';
import { formatIndianNumber } from '@/lib/utils';
import { TransferDialog } from './transfer-dialog';


const iconMap: { [key: string]: Icon } = {
    Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Briefcase, Coins, Home, Car, School
};

const TransactionItem = ({ transaction, categoryName, categoryIcon, onEdit, onDelete, accountName, remainingBalance }: { transaction: Transaction, categoryName: string, categoryIcon: Icon, onEdit: () => void, onDelete: () => void, accountName: string, remainingBalance: number }) => {
  const isIncome = transaction.type === 'income';
  const CategoryIcon = categoryIcon;

  return (
    <div className="flex items-center gap-4 py-4 border-b">
        <div className="p-3 bg-accent rounded-full">
            <CategoryIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
            <div className="flex justify-between items-baseline">
                <p className="font-semibold">{transaction.description}</p>
                <p className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}₹{formatIndianNumber(transaction.amount)}
                </p>
            </div>
            <div className="flex justify-between items-baseline text-sm text-muted-foreground">
                <p>{accountName}</p>
                <p>Balance: ₹{formatIndianNumber(remainingBalance)}</p>
            </div>
             <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <p>{format(parseISO(transaction.date), 'dd-MMM-yyyy')}</p>
                 <div className="opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    </div>
  );
};

export function BudgetTrackerPage() {
  const { profile, addTransaction, updateTransaction, deleteTransaction, addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, contributeToGoal, transferBetweenAccounts } = useProfile();
  const { accounts, transactions, categories } = profile.budget;
  const goals = useMemo(() => {
    const budgetGoals = profile.budget.goals;
    if (Array.isArray(budgetGoals)) {
      return budgetGoals;
    }
    if (typeof budgetGoals === 'object' && budgetGoals !== null) {
      return Object.values(budgetGoals);
    }
    return [];
  }, [profile.budget.goals]);
  
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | undefined>();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'transaction' | 'account' | 'category' | 'goal' } | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const lastMonth = subMonths(startOfMonth(now), 1);

    const currentMonthIncome = transactions.filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), now)).reduce((sum, t) => sum + t.amount, 0);
    const lastMonthIncome = transactions.filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), lastMonth)).reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now)).reduce((sum, t) => sum + t.amount, 0);
    const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), lastMonth)).reduce((sum, t) => sum + t.amount, 0);

    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return {
        income: {
            total: currentMonthIncome,
            change: calcChange(currentMonthIncome, lastMonthIncome),
        },
        expenses: {
            total: currentMonthExpenses,
            change: calcChange(currentMonthExpenses, lastMonthExpenses),
        }
    }
  }, [transactions]);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map(a => [a.id, a])), [accounts]);

  const recentTransactions = useMemo(() => {
    const filtered = transactions.filter(t => transactionFilter === 'all' || t.type === transactionFilter);
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const accountBalances = new Map(accounts.map(acc => [acc.id, acc.balance]));
    const transactionWithBalance: (Transaction & { remainingBalance: number })[] = [];

    // To calculate running balance correctly, we need to iterate from oldest to newest
    const reversedSorted = [...sorted].reverse();
    const futureBalances: { [key: string]: number } = {};

    for (const tx of reversedSorted) {
        const balance = accountBalances.get(tx.accountId) ?? 0;
        const amountChange = tx.type === 'income' ? -tx.amount : tx.amount;
        accountBalances.set(tx.accountId, balance + amountChange);
        futureBalances[tx.id] = accountBalances.get(tx.accountId) ?? 0;
    }

    return sorted.slice(0, 15).map(tx => ({
        ...tx,
        remainingBalance: futureBalances[tx.id] ?? (accountMap.get(tx.accountId)?.balance || 0),
    }));
    
  }, [transactions, transactionFilter, accounts, accountMap]);

  const transactionsByAccount = useMemo(() => {
      const grouped: { [key: string]: Transaction[] } = {};
      transactions.forEach(t => {
          if (!grouped[t.accountId]) {
              grouped[t.accountId] = [];
          }
          grouped[t.accountId].push(t);
      });
      return grouped;
  }, [transactions]);
  

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
    if (itemToDelete.type === 'goal') deleteSavingsGoal(itemToDelete.id);
    setItemToDelete(null);
  };
  
  const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    if (value === 0 || !isFinite(value)) return null;

    return (
        <span className={`flex items-center text-xs ml-2 ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
           {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
           {Math.abs(value).toFixed(0)}%
        </span>
    )
  };


  return (
    <div className="space-y-6 pb-12">
      <Card className="bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground">
        <CardContent className="p-6">
          <div className="text-sm text-primary-foreground/80">Total Balance</div>
          <div className="text-4xl font-bold">₹{formatIndianNumber(totalBalance)}</div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-300" />
              <div>
                <div className="text-xs">Expenses (This Month)</div>
                <div className="font-semibold flex items-center">
                    ₹{formatIndianNumber(monthlyStats.expenses.total)}
                    <ChangeIndicator value={monthlyStats.expenses.change} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-300" />
              <div>
                <div className="text-xs">Income (This Month)</div>
                <div className="font-semibold flex items-center">
                    ₹{formatIndianNumber(monthlyStats.income.total)}
                    <ChangeIndicator value={monthlyStats.income.change} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="transactions" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto p-1 mb-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className='flex items-center gap-2'>
                  <CardTitle>Recent Activity</CardTitle>
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={transactionFilter} onValueChange={(v) => setTransactionFilter(v as 'all' | 'income' | 'expense')}>
                                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="income">Income</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="expense">Expenses</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsTransferDialogOpen(true)} className="gap-2" size="sm" variant="outline">
                        <ArrowRightLeft className="h-4 w-4" /> Transfer
                    </Button>
                    <Button onClick={() => { setEditingTransaction(undefined); setIsTxDialogOpen(true); }} className="gap-2" size="sm">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recentTransactions.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                        {recentTransactions.map(t => {
                            const category = categoryMap.get(t.categoryId);
                            const account = accountMap.get(t.accountId);
                            return (
                                <TransactionItem 
                                    key={t.id}
                                    transaction={t}
                                    categoryName={category?.name || 'Uncategorized'}
                                    categoryIcon={iconMap[category?.icon || ''] || Utensils}
                                    onEdit={() => { setEditingTransaction(t); setIsTxDialogOpen(true); }}
                                    onDelete={() => setItemToDelete({ id: t.id, type: 'transaction'})}
                                    accountName={account?.name || 'Unknown Account'}
                                    remainingBalance={t.remainingBalance}
                                />
                            )
                        })}
                    </ScrollArea>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No transactions for this filter.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Accounts</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setEditingAccount(undefined); setIsAccountDialogOpen(true); }}><Plus className="h-4 w-4"/>Add</Button>
                </CardHeader>
                <CardContent>
                     {accounts.map(acc => (
                        <div key={acc.id} className="flex items-center gap-4 py-2">
                            <div className="p-2 bg-accent rounded-full"><Wallet className="h-4 w-4 text-primary"/></div>
                            <div className="flex-1 font-medium">{acc.name}</div>
                            <div className="font-semibold">₹{formatIndianNumber(acc.balance)}</div>
                            <div className="opacity-100 transition-opacity">
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAccount(acc); setIsAccountDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                            </div>
                        </div>
                     ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Spending Categories</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setEditingCategory(undefined); setIsCategoryDialogOpen(true); }}><Plus className="h-4 w-4"/>Add</Button>
                </CardHeader>
                <CardContent>
                     {categories.filter(c => c.id !== 'cat-income').map(cat => {
                        const CategoryIcon = iconMap[cat.icon] || Utensils;
                        const isDefault = cat.id.startsWith('cat-');
                        return (
                            <div key={cat.id} className="flex items-center gap-4 py-2">
                                <div className="p-2 bg-accent rounded-full"><CategoryIcon className="h-4 w-4 text-primary"/></div>
                                <div className="flex-1 font-medium">{cat.name}</div>
                                {!isDefault && (
                                    <div className="opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(cat); setIsCategoryDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setItemToDelete({ id: cat.id, type: 'category' })}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </div>
                        )
                     })}
                </CardContent>
              </Card>
        </TabsContent>
        <TabsContent value="goals" className="mt-4">
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Savings Goals</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setEditingGoal(undefined); setIsGoalDialogOpen(true); }}><Plus className="h-4 w-4"/>Add</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {goals.map(goal => {
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        return (
                            <div key={goal.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>{goal.name}</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => {setGoalToContribute(goal); setIsContributeDialogOpen(true);}}><Gem className="mr-2 h-4 w-4" />Contribute</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setEditingGoal(goal); setIsGoalDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setItemToDelete({ id: goal.id, type: 'goal' })} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <span>₹{formatIndianNumber(goal.currentAmount)}</span>
                                    <span>₹{formatIndianNumber(goal.targetAmount)}</span>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="analytics" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Budget Analytics</CardTitle>
                    <CardDescription>Visualize your income and spending habits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                         <Card>
                             <CardHeader className="p-3">
                                <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
                             </CardHeader>
                             <CardContent className="p-3 pt-0">
                                <p className="text-2xl font-bold">₹{formatIndianNumber(monthlyStats.income.total)}</p>
                             </CardContent>
                         </Card>
                          <Card>
                             <CardHeader className="p-3">
                                <CardTitle className="text-sm font-medium">This Month's Expenses</CardTitle>
                             </CardHeader>
                             <CardContent className="p-3 pt-0">
                                <p className="text-2xl font-bold">₹{formatIndianNumber(monthlyStats.expenses.total)}</p>
                             </CardContent>
                         </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Spending Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px] flex justify-center items-center">
                            <BudgetBreakdownChart />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions by Account</CardTitle>
                            <CardDescription>Recent activity for each account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={accounts[0]?.id || 'no-accounts'}>
                                <TabsList className="grid w-full grid-cols-2">
                                {accounts.map(account => (
                                    <TabsTrigger key={account.id} value={account.id}>{account.name}</TabsTrigger>
                                ))}
                                </TabsList>
                            {accounts.map(account => (
                                    <TabsContent key={account.id} value={account.id}>
                                        {(transactionsByAccount[account.id] || []).slice(0, 5).map(t => {
                                            const category = categoryMap.get(t.categoryId);
                                            return (
                                                <TransactionItem
                                                    key={t.id}
                                                    transaction={t}
                                                    categoryName={category?.name || 'Uncategorized'}
                                                    categoryIcon={iconMap[category?.icon || ''] || Utensils}
                                                    onEdit={() => { setEditingTransaction(t); setIsTxDialogOpen(true); }}
                                                    onDelete={() => setItemToDelete({ id: t.id, type: 'transaction'})}
                                                    accountName={accountMap.get(t.accountId)?.name || 'Unknown'}
                                                    remainingBalance={accountMap.get(t.accountId)?.balance || 0}
                                                />
                                            );
                                        })}
                                        {(transactionsByAccount[account.id] || []).length === 0 && (
                                            <p className="text-muted-foreground text-center py-4">No transactions for this account.</p>
                                        )}
                                    </TabsContent>
                            ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>


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
      <SavingsGoalDialog
        open={isGoalDialogOpen}
        onOpenChange={setIsGoalDialogOpen}
        onSave={editingGoal ? updateSavingsGoal : addSavingsGoal}
        goal={editingGoal}
      />
       <TransferDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onTransfer={transferBetweenAccounts}
        accounts={accounts}
      />
      {goalToContribute && (
        <ContributeToGoalDialog
            open={isContributeDialogOpen}
            onOpenChange={setIsContributeDialogOpen}
            onContribute={(amount, accountId) => contributeToGoal(goalToContribute.id, amount, accountId)}
            accounts={accounts}
            goalName={goalToContribute.name}
        />
      )}
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

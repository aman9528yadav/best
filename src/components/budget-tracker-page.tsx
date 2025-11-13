
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ArrowUp, ArrowDown, Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Icon, Edit, Trash2, Settings, Wallet, PiggyBank, Briefcase, Coins, Home, Car, Filter, Target, Gem, School, LineChart, Repeat, ArrowRightLeft, Calendar, Trophy, Sparkles, CheckSquare } from 'lucide-react';
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
import { cn } from '@/lib/utils';


const iconMap: { [key: string]: Icon } = {
    Landmark, Utensils, Bus, ShoppingBag, FileText, HeartPulse, Ticket, Briefcase, Coins, Home, Car, School, Wallet, Gem, Sparkles
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


const StatCard = ({ title, value, change, color, icon: Icon }: { title: string; value: string; change?: number; color: string, icon: Icon }) => {
    const isPositive = change !== undefined && change >= 0;
    return (
        <Card className={cn("text-white", color)}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{title}</span>
                    <Icon className="h-5 w-5 opacity-80" />
                </div>
                <div className="text-3xl font-bold mt-2">{value}</div>
                {change !== undefined && (
                     <div className="flex items-center text-xs opacity-90 mt-1">
                        {isPositive ? <ArrowUp className="h-3 w-3 mr-1"/> : <ArrowDown className="h-3 w-3 mr-1"/>}
                        {Math.abs(change).toFixed(1)}% from last month
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

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
    
    const savingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0;

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
        },
        savingsRate: savingsRate
    }
  }, [transactions]);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map(a => [a.id, a])), [accounts]);

  const recentTransactions = useMemo(() => {
    const filtered = transactions.filter(t => transactionFilter === 'all' || t.type === transactionFilter);
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const accountBalances = new Map(accounts.map(acc => [acc.id, acc.balance]));
    const transactionWithBalance: (Transaction & { remainingBalance: number })[] = [];

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


  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold">Budget Manager</h1>
        <p className="text-muted-foreground">Take control of your finances with clarity and confidence</p>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" className="gap-2"><Calendar className="h-4 w-4" />This Month</Button>
        <Button size="sm" className="gap-2" onClick={() => setIsTxDialogOpen(true)}><Plus className="h-4 w-4" />Add Transaction</Button>
      </div>
      
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Balance" value={`₹${formatIndianNumber(totalBalance)}`} change={monthlyStats.income.change - monthlyStats.expenses.change} color="bg-blue-500" icon={Wallet} />
            <StatCard title="Monthly Income" value={`₹${formatIndianNumber(monthlyStats.income.total)}`} change={monthlyStats.income.change} color="bg-green-500" icon={ArrowDown} />
            <StatCard title="Monthly Expenses" value={`₹${formatIndianNumber(monthlyStats.expenses.total)}`} change={monthlyStats.expenses.change} color="bg-red-500" icon={ArrowUp} />
            <StatCard title="Savings Rate" value={`${monthlyStats.savingsRate.toFixed(1)}%`} color="bg-purple-500" icon={PiggyBank} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Accounts</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Achievements</CardTitle>
                    <CardDescription>Your financial milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-green-600"/>
                        <div>
                            <p className="font-semibold">First Budget</p>
                            <p className="text-xs text-muted-foreground">Create your first budget</p>
                        </div>
                        </div>
                        <CheckSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Gem className="h-5 w-5 text-green-600"/>
                        <div>
                            <p className="font-semibold">Saver</p>
                            <p className="text-xs text-muted-foreground">Save ₹10,000</p>
                        </div>
                        </div>
                        <CheckSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500"/>
                        <div>
                            <p className="font-semibold">Consistent</p>
                            <p className="text-xs text-muted-foreground">Log expenses for 7 days straight</p>
                        </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />Budget Overview</CardTitle>
                    <CardDescription>Monthly budget status by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium flex items-center gap-2"><Utensils className="h-4 w-4 text-muted-foreground"/>Food & Dining</span>
                            <span className="text-muted-foreground">₹12,876 / ₹15,000</span>
                        </div>
                        <Progress value={85} />
                    </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium flex items-center gap-2"><Bus className="h-4 w-4 text-muted-foreground"/>Transportation</span>
                            <span className="text-muted-foreground">₹6,200 / ₹8,000</span>
                        </div>
                        <Progress value={77} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-muted-foreground"/>Entertainment</span>
                            <span className="text-muted-foreground">₹2,850 / ₹5,000</span>
                        </div>
                        <Progress value={57} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium flex items-center gap-2"><HeartPulse className="h-4 w-4 text-muted-foreground"/>Healthcare</span>
                            <span className="text-muted-foreground">₹1,200 / ₹3,000</span>
                        </div>
                        <Progress value={40} />
                    </div>
                </CardContent>
           </Card>
        </TabsContent>
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
         <TabsContent value="budgets" className="mt-4 space-y-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />Manage Accounts</CardTitle>
                        <CardDescription>Your cash, bank, and other wallets.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsTransferDialogOpen(true)} className="gap-2" size="sm" variant="outline">
                            <ArrowRightLeft className="h-4 w-4" /> Transfer
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => {setEditingAccount(undefined); setIsAccountDialogOpen(true)}}><Plus className="h-4 w-4"/>Add Account</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {accounts.map(account => (
                         <div key={account.id} className="p-4 border rounded-lg flex justify-between items-center">
                             <div>
                                <p className="font-semibold">{account.name}</p>
                                <p className="text-sm text-muted-foreground">Balance: ₹{formatIndianNumber(account.balance)}</p>
                             </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {setEditingAccount(account); setIsAccountDialogOpen(true);}}><Edit className="h-4 w-4 mr-2"/>Edit Account</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete({id: account.id, type: 'account'})}><Trash2 className="h-4 w-4 mr-2"/>Delete Account</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    ))}
                </CardContent>
             </Card>
        </TabsContent>
        <TabsContent value="goals" className="mt-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Savings Goals</CardTitle>
                        <CardDescription>Track your progress towards financial goals</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => {setEditingGoal(undefined); setIsGoalDialogOpen(true)}}><Plus className="h-4 w-4"/>Add Goal</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {goals.map(goal => {
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        const remaining = goal.targetAmount - goal.currentAmount;
                        return (
                            <div key={goal.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400"/></div>
                                        <div>
                                            <p className="font-semibold flex items-center gap-2">{goal.name}</p>
                                            <p className="text-xs text-muted-foreground">Target: ₹{formatIndianNumber(goal.targetAmount)}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {setEditingGoal(goal); setIsGoalDialogOpen(true);}}><Edit className="h-4 w-4 mr-2"/>Edit Goal</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete({id: goal.id, type: 'goal'})}><Trash2 className="h-4 w-4 mr-2"/>Delete Goal</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">Progress</span>
                                        <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Current</span>
                                        <span className="font-semibold">₹{formatIndianNumber(goal.currentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Remaining</span>
                                        <span className="font-semibold">₹{formatIndianNumber(remaining)}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={() => {setGoalToContribute(goal); setIsContributeDialogOpen(true)}}>Add Funds</Button>
                            </div>
                        )
                    })}
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
        onAddCategory={() => setIsCategoryDialogOpen(true)}
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


"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Transaction, Category, Account } from '@/context/ProfileContext';
import { format } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';
import { FileText, Tag, Wallet, Landmark, Hash, Banknote, LandmarkIcon } from 'lucide-react';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction & { beforeBalance: number; afterBalance: number };
  category?: Category;
  account?: Account;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <div className="text-sm font-medium text-right">{value}</div>
    </div>
);

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
  category,
  account,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction.description}</DialogTitle>
          <DialogDescription>
            {format(new Date(transaction.date), 'PPPP, p')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className={`text-4xl font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                {isIncome ? '+' : '-'}₹{formatIndianNumber(transaction.amount)}
            </div>

            <Separator />
            
            <div className="space-y-3">
                <DetailRow icon={LandmarkIcon} label="Account" value={account?.name || 'N/A'} />
                <DetailRow icon={Wallet} label="Category" value={category?.name || 'Uncategorized'} />
                
                <Separator />
                
                <DetailRow icon={Banknote} label="Balance Before" value={`₹${formatIndianNumber(transaction.beforeBalance)}`} />
                <DetailRow icon={Banknote} label="Balance After" value={`₹${formatIndianNumber(transaction.afterBalance)}`} />
                
                <Separator />
                
                {transaction.notes && (
                     <DetailRow icon={FileText} label="Notes" value={<p className="text-sm text-muted-foreground text-right">{transaction.notes}</p>} />
                )}

                {transaction.tags && transaction.tags.length > 0 && (
                    <DetailRow 
                        icon={Tag} 
                        label="Tags" 
                        value={
                             <div className="flex flex-wrap gap-1 justify-end">
                                {transaction.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        } 
                    />
                )}
                 <DetailRow icon={Hash} label="Transaction ID" value={<span className="text-xs font-mono">{transaction.id}</span>} />

            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


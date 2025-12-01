import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/api';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Safely filter and sort transactions
  const validTransactions = (transactions || [])
    .filter((tx) => tx && tx.amount != null && tx.date)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {validTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {validTransactions.map((tx, index) => {
              // Safely parse amount (handle string from DECIMAL type)
              const amount = typeof tx.amount === 'string' 
                ? parseFloat(tx.amount) 
                : Number(tx.amount) || 0;
              
              // Safely parse date
              const date = tx.date ? new Date(tx.date) : new Date();
              const isValidDate = !isNaN(date.getTime());
              
              return (
                <motion.div
                  key={tx.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        tx.type === 'income'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || 'No description'}</p>
                      <p className="text-xs text-muted-foreground">{tx.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold text-base',
                        tx.type === 'income' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isValidDate ? date.toLocaleDateString() : 'Invalid date'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

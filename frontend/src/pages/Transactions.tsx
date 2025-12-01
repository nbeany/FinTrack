import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { transactionApi, type Transaction } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const fetchTransactions = async () => {
    try {
      const { data } = await transactionApi.getAll();
      // Ensure we always set an array, even if API returns null/undefined
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load transactions');
      setTransactions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreate = async (data: Omit<Transaction, 'id'>) => {
    try {
      await transactionApi.create(data);
      toast.success('Transaction added');
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleUpdate = async (data: Omit<Transaction, 'id'>) => {
    if (!editingTx?.id) return;
    try {
      await transactionApi.update(editingTx.id, data);
      toast.success('Transaction updated');
      setEditingTx(null);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await transactionApi.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const filteredTransactions = (transactions || [])
    .filter((tx) => {
      // Filter out invalid transactions
      if (!tx || !tx.type || tx.amount == null || !tx.date) return false;
      
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const description = (tx.description || '').toLowerCase();
        const category = (tx.category || '').toLowerCase();
        return (
          description.includes(searchLower) ||
          category.includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Safe date sorting
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateB - dateA;
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Manage your income and expenses
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as typeof filterType)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-secondary/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search || filterType !== 'all'
                  ? 'No transactions match your filters'
                  : 'No transactions yet. Add your first one!'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          tx.type === 'income'
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-6 h-6 text-success" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || 'No description'}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.category || 'Uncategorized'} • {
                            (() => {
                              const date = new Date(tx.date);
                              return isNaN(date.getTime()) 
                                ? 'Invalid date' 
                                : date.toLocaleDateString();
                            })()
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={cn(
                          'text-lg font-semibold',
                          tx.type === 'income' ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {(() => {
                          // Safely parse amount (handle string from DECIMAL type)
                          const amount = typeof tx.amount === 'string' 
                            ? parseFloat(tx.amount) 
                            : Number(tx.amount) || 0;
                          return `${tx.type === 'income' ? '+' : '-'}$${amount.toFixed(2)}`;
                        })()}
                      </p>
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTx(tx)}
                          className="hover:bg-primary/10"
                          title="Edit transaction"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => tx.id && handleDelete(tx.id)}
                          className="hover:bg-destructive/10 text-destructive"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {(showForm || editingTx) && (
          <TransactionForm
            onSubmit={editingTx ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingTx(null);
            }}
            initialData={editingTx || undefined}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

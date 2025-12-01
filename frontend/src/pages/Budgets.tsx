import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { budgetApi, transactionApi, type Budget, type Transaction } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchData = async () => {
    try {
      const [budRes, txRes] = await Promise.all([
        budgetApi.getAll(),
        transactionApi.getAll(),
      ]);
      // Ensure we always set arrays, even if API returns null/undefined
      setBudgets(Array.isArray(budRes?.data) ? budRes.data : []);
      setTransactions(Array.isArray(txRes?.data) ? txRes.data : []);
    } catch (error) {
      toast.error('Failed to load budgets');
      // Set empty arrays on error to prevent undefined issues
      setBudgets([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: Omit<Budget, 'id' | 'spent_amount'>) => {
    try {
      await budgetApi.create(data);
      toast.success('Budget created');
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create budget');
    }
  };

  const handleUpdate = async (data: Omit<Budget, 'id' | 'spent_amount'>) => {
    if (!editingBudget?.id) return;
    try {
      await budgetApi.update(editingBudget.id, data);
      toast.success('Budget updated');
      setEditingBudget(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await budgetApi.delete(id);
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  // Calculate spent amounts per category from transactions
  const categorySpending = (transactions || [])
    .filter((tx) => tx && tx.type === 'expense' && tx.amount != null && tx.category)
    .reduce((acc, tx) => {
      // Safely parse amount (handle string from DECIMAL type)
      const amount = typeof tx.amount === 'string' 
        ? parseFloat(tx.amount) 
        : Number(tx.amount) || 0;
      const category = tx.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

  const budgetsWithSpent = (budgets || [])
    .filter((b) => b && b.category && b.limit_amount != null)
    .map((budget) => {
      const limitAmount = typeof budget.limit_amount === 'string' 
        ? parseFloat(budget.limit_amount) 
        : Number(budget.limit_amount) || 0;
      const spentAmount = categorySpending[budget.category] || 0;
      return {
        ...budget,
        limit_amount: limitAmount,
        spent_amount: spentAmount,
      };
    });

  const totalBudget = budgetsWithSpent.reduce((sum, b) => {
    const amount = typeof b.limit_amount === 'string' 
      ? parseFloat(b.limit_amount) 
      : Number(b.limit_amount) || 0;
    return sum + amount;
  }, 0);
  
  const totalSpent = budgetsWithSpent.reduce((sum, b) => {
    const amount = typeof b.spent_amount === 'string' 
      ? parseFloat(b.spent_amount) 
      : Number(b.spent_amount) || 0;
    return sum + amount;
  }, 0);
  
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Set limits and track your spending
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Budget
          </Button>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-chart-budget/10 to-chart-budget/5 border-chart-budget/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Overall Budget
                  </p>
                  <p className="text-3xl font-bold">
                    ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-lg text-muted-foreground font-normal">
                      / ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    overallPercent > 100
                      ? 'bg-destructive/20 text-destructive'
                      : overallPercent > 80
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                  )}
                >
                  {overallPercent > 100 ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <CheckCircle className="w-7 h-7" />
                  )}
                </div>
              </div>
              <Progress
                value={Math.min(overallPercent, 100)}
                className={cn(
                  'h-3',
                  overallPercent > 100
                    ? '[&>div]:bg-destructive'
                    : overallPercent > 80
                    ? '[&>div]:bg-warning'
                    : '[&>div]:bg-success'
                )}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {overallPercent.toFixed(0)}% of total budget used
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-secondary/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : budgetsWithSpent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No budgets yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-4">
                {budgetsWithSpent.map((budget, index) => {
                  // Safely parse amounts
                  const limitAmount = typeof budget.limit_amount === 'string' 
                    ? parseFloat(budget.limit_amount) 
                    : Number(budget.limit_amount) || 0;
                  const spentAmount = typeof budget.spent_amount === 'string' 
                    ? parseFloat(budget.spent_amount) 
                    : Number(budget.spent_amount) || 0;
                  
                  const percent = limitAmount > 0
                    ? (spentAmount / limitAmount) * 100
                    : 0;
                  const isOver = percent > 100;
                  const isWarning = percent > 80 && percent <= 100;

                  return (
                    <motion.div
                      key={budget.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{budget.category || 'Uncategorized'}</p>
                          <p className="text-sm text-muted-foreground">
                            ${spentAmount.toFixed(2)} / $
                            {limitAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'text-sm font-medium px-2 py-1 rounded',
                              isOver
                                ? 'bg-destructive/20 text-destructive'
                                : isWarning
                                ? 'bg-warning/20 text-warning'
                                : 'bg-success/20 text-success'
                            )}
                          >
                            {percent.toFixed(0)}%
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingBudget(budget)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => budget.id && handleDelete(budget.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(percent, 100)}
                        className={cn(
                          'h-2',
                          isOver
                            ? '[&>div]:bg-destructive'
                            : isWarning
                            ? '[&>div]:bg-warning'
                            : '[&>div]:bg-success'
                        )}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {(showForm || editingBudget) && (
          <BudgetForm
            onSubmit={editingBudget ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingBudget(null);
            }}
            initialData={editingBudget || undefined}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

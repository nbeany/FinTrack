import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { transactionApi, investmentApi, budgetApi, type Transaction, type Investment, type Budget } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, invRes, budRes] = await Promise.all([
          transactionApi.getAll(),
          investmentApi.getAll(),
          budgetApi.getAll(),
        ]);
        // Ensure we always set arrays, even if API returns null/undefined
        setTransactions(Array.isArray(txRes?.data) ? txRes.data : []);
        setInvestments(Array.isArray(invRes?.data) ? invRes.data : []);
        setBudgets(Array.isArray(budRes?.data) ? budRes.data : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set empty arrays on error to prevent undefined issues
        setTransactions([]);
        setInvestments([]);
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Auto-refresh investments every 30 seconds for real-time price updates
    const interval = setInterval(() => {
      investmentApi.getAll()
        .then((res) => {
          setInvestments(Array.isArray(res?.data) ? res.data : []);
        })
        .catch((err) => {
          console.error('Failed to refresh investments:', err);
        });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Safely calculate totals with proper type handling
  const totalIncome = (transactions || [])
    .filter((tx) => tx && tx.type === 'income' && tx.amount != null)
    .reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount) || 0;
      return sum + amount;
    }, 0);

  const totalExpenses = (transactions || [])
    .filter((tx) => tx && tx.type === 'expense' && tx.amount != null)
    .reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount) || 0;
      return sum + amount;
    }, 0);

  const netBalance = totalIncome - totalExpenses;

  const portfolioValue = (investments || [])
    .filter((inv) => inv && inv.quantity != null && inv.current_price != null)
    .reduce((sum, inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const price = typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price) || 0;
      return sum + quantity * price;
    }, 0);

  const portfolioCost = (investments || [])
    .filter((inv) => inv && inv.quantity != null && inv.buy_price != null)
    .reduce((sum, inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const price = typeof inv.buy_price === 'string' ? parseFloat(inv.buy_price) : Number(inv.buy_price) || 0;
      return sum + quantity * price;
    }, 0);

  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPercent =
    portfolioCost > 0 ? ((portfolioGain / portfolioCost) * 100).toFixed(1) : '0';

  const totalBudget = (budgets || [])
    .filter((b) => b && b.limit_amount != null)
    .reduce((sum, b) => {
      const amount = typeof b.limit_amount === 'string' ? parseFloat(b.limit_amount) : Number(b.limit_amount) || 0;
      return sum + amount;
    }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your financial overview
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Balance"
            value={`$${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            change={netBalance >= 0 ? 'Looking good!' : 'Time to save'}
            changeType={netBalance >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
            iconColor="primary"
            delay={0}
          />
          <StatCard
            title="Total Income"
            value={`$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            iconColor="success"
            delay={0.1}
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            iconColor="accent"
            delay={0.2}
          />
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            change={`${portfolioGain >= 0 ? '+' : ''}${portfolioGainPercent}% return`}
            changeType={portfolioGain >= 0 ? 'positive' : 'negative'}
            icon={Wallet}
            iconColor="warning"
            delay={0.3}
          />
        </div>

        {/* Charts & Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: investments.length > 0 ? 0.5 : 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <SpendingChart transactions={transactions} />
          <RecentTransactions transactions={transactions} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

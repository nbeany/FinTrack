import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InvestmentForm } from '@/components/investments/InvestmentForm';
import { InvestmentPerformanceChart } from '@/components/dashboard/InvestmentPerformanceChart';
import { PortfolioDistributionChart } from '@/components/dashboard/PortfolioDistributionChart';
import { ProfitLossChart } from '@/components/dashboard/ProfitLossChart';
import { investmentApi, type Investment } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [expandedInvestments, setExpandedInvestments] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchInvestments = useCallback(async (showError = true) => {
    try {
      const { data } = await investmentApi.getAll();
      // Ensure we always set an array, even if API returns null/undefined
      setInvestments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load investments:', error);
      // Only show toast on initial load, not on auto-refresh
      if (showError) {
        toast.error('Failed to load investments');
      }
      setInvestments([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load with error toast
    fetchInvestments(true);
    
    // Auto-refresh investments every 30 seconds for real-time price updates
    const interval = setInterval(() => {
      fetchInvestments(false); // Silent refresh
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [fetchInvestments]);

  const handleCreate = async (data: Omit<Investment, 'id'>) => {
    try {
      await investmentApi.create(data);
      toast.success('Investment added');
      setShowForm(false);
      fetchInvestments(false);
    } catch (error) {
      toast.error('Failed to add investment');
    }
  };

  const handleUpdate = async (data: Omit<Investment, 'id'>) => {
    if (!editingInv?.id) return;
    try {
      await investmentApi.update(editingInv.id, data);
      toast.success('Investment updated');
      setEditingInv(null);
      fetchInvestments(false);
    } catch (error) {
      toast.error('Failed to update investment');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await investmentApi.delete(id);
      toast.success('Investment deleted');
      setDeleteConfirm(null);
      fetchInvestments(false);
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedInvestments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalValue = (investments || [])
    .filter((inv) => inv && inv.quantity != null && inv.current_price != null)
    .reduce((sum, inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const price = typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price) || 0;
      return sum + quantity * price;
    }, 0);

  const totalCost = (investments || [])
    .filter((inv) => inv && inv.quantity != null && inv.buy_price != null)
    .reduce((sum, inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const price = typeof inv.buy_price === 'string' ? parseFloat(inv.buy_price) : Number(inv.buy_price) || 0;
      return sum + quantity * price;
    }, 0);

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

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
            <h1 className="text-3xl font-bold">Investments</h1>
            <p className="text-muted-foreground mt-1">
              Track your portfolio performance
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Investment
          </Button>
        </motion.div>

        {/* Real-time indicator */}
        {investments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-75" />
              </div>
              <div>
                <p className="text-sm font-medium">Live Price Updates</p>
                <p className="text-xs text-muted-foreground">
                  Prices refresh automatically every 30 seconds
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInvestments(false)}
              className="text-xs"
            >
              Refresh Now
            </Button>
          </motion.div>
        )}

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Value</span>
              </div>
              <p className="text-3xl font-bold">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground">Total Cost</span>
              </div>
              <p className="text-3xl font-bold">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              'border-l-4',
              totalGain >= 0 ? 'border-l-success' : 'border-l-destructive'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {totalGain >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <span className="text-sm text-muted-foreground">Total Return</span>
              </div>
              <p
                className={cn(
                  'text-3xl font-bold',
                  totalGain >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {totalGain >= 0 ? '+' : ''}$
                {totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p
                className={cn(
                  'text-sm mt-1',
                  totalGain >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                ({totalGainPercent >= 0 ? '+' : ''}
                {totalGainPercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Analysis Charts */}
        {investments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Portfolio Analysis</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InvestmentPerformanceChart investments={investments} />
              <PortfolioDistributionChart investments={investments} />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <ProfitLossChart investments={investments} />
            </div>
          </motion.div>
        )}

        {/* Investments List */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Your Holdings</CardTitle>
              <span className="text-sm text-muted-foreground">
                {investments.length} {investments.length === 1 ? 'investment' : 'investments'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-secondary/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No investments yet. Add your first one!
              </div>
            ) : (
              <div className="space-y-4">
                {(investments || [])
                  .filter((inv) => inv && inv.symbol)
                  .map((inv, index) => {
                    // Safely parse all numeric values with defaults
                    const quantity = inv.quantity != null ? (typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity)) : 0;
                    const currentPrice = inv.current_price != null ? (typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price)) : 0;
                    const buyPrice = inv.buy_price != null ? (typeof inv.buy_price === 'string' ? parseFloat(inv.buy_price) : Number(inv.buy_price)) : 0;
                    
                    const value = quantity * currentPrice;
                    const cost = quantity * buyPrice;
                    const gain = value - cost;
                    const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
                    const symbol = inv.symbol || 'N/A';
                    const isExpanded = expandedInvestments.has(inv.id || 0);
                    const priceChange = currentPrice - buyPrice;
                    const priceChangePercent = buyPrice > 0 ? ((priceChange / buyPrice) * 100) : 0;

                    return (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                                  <span className="font-bold text-lg text-primary">
                                    {symbol.length >= 2 ? symbol.slice(0, 2) : symbol}
                                  </span>
                                </div>
                                {inv.asset_type && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">
                                      {inv.asset_type.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-semibold text-lg">{symbol}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {inv.asset_type?.replace('_', ' ') || 'N/A'}
                                  </Badge>
                                  {inv.exchange && (
                                    <Badge variant="outline" className="text-xs">
                                      {inv.exchange}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Quantity:</span>
                                    <span className="font-semibold text-foreground">{quantity} units</span>
                                  </div>
                                  <span className="text-muted-foreground">•</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Buy Price:</span>
                                    <span className="font-semibold text-foreground">${buyPrice.toFixed(2)}</span>
                                  </div>
                                  <span className="text-muted-foreground">•</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className={cn(
                                      'font-semibold',
                                      currentPrice > buyPrice ? 'text-success' : currentPrice < buyPrice ? 'text-destructive' : 'text-foreground'
                                    )}>
                                      ${currentPrice.toFixed(2)}
                                    </span>
                                    {priceChange !== 0 && (
                                      <span className={cn(
                                        'text-xs font-medium px-1.5 py-0.5 rounded',
                                        priceChange > 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                                      )}>
                                        {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                                      </span>
                                    )}
                                  </div>
                                  {inv.exchange && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">Exchange: <span className="font-medium text-foreground">{inv.exchange}</span></span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right min-w-[160px]">
                                <p className="font-bold text-lg mb-1">
                                  ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center gap-2 justify-end">
                                  <p
                                    className={cn(
                                      'text-sm font-semibold',
                                      gain >= 0 ? 'text-success' : 'text-destructive'
                                    )}
                                  >
                                    {gain >= 0 ? '+' : ''}${Math.abs(gain).toFixed(2)}
                                  </p>
                                  <Badge
                                    variant={gain >= 0 ? 'default' : 'destructive'}
                                    className={cn(
                                      'text-xs font-medium',
                                      gain >= 0 && 'bg-success/20 text-success border-success/30'
                                    )}
                                  >
                                    {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => inv.id && toggleExpanded(inv.id)}
                                  className="hover:bg-primary/10"
                                  title={isExpanded ? 'Hide details' : 'Show details'}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => inv.id && setEditingInv(inv)}
                                  className="hover:bg-primary/10"
                                  title="Edit investment"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => inv.id && setDeleteConfirm(inv.id)}
                                  className="hover:bg-destructive/10 text-destructive"
                                  title="Delete investment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && inv.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border bg-secondary/30"
                          >
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                                <p className="text-sm font-semibold">{quantity} units</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Buy Price</p>
                                <p className="text-sm font-semibold">${buyPrice.toFixed(2)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Current Price</p>
                                <p className={cn(
                                  'text-sm font-semibold',
                                  currentPrice > buyPrice ? 'text-success' : currentPrice < buyPrice ? 'text-destructive' : ''
                                )}>
                                  ${currentPrice.toFixed(2)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Total Cost</p>
                                <p className="text-sm font-semibold">${cost.toFixed(2)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Current Value</p>
                                <p className="text-sm font-semibold">${value.toFixed(2)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Profit/Loss</p>
                                <p className={cn(
                                  'text-sm font-semibold',
                                  gain >= 0 ? 'text-success' : 'text-destructive'
                                )}>
                                  {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Return %</p>
                                <p className={cn(
                                  'text-sm font-semibold',
                                  gainPercent >= 0 ? 'text-success' : 'text-destructive'
                                )}>
                                  {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Asset Type</p>
                                <p className="text-sm font-semibold capitalize">
                                  {inv.asset_type?.replace('_', ' ') || 'N/A'}
                                </p>
                              </div>
                              {inv.created_at && (
                                <div className="space-y-1 md:col-span-2">
                                  <p className="text-xs text-muted-foreground font-medium">Purchase Date</p>
                                  <p className="text-sm font-semibold">
                                    {new Date(inv.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
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
        {(showForm || editingInv) && (
          <InvestmentForm
            onSubmit={editingInv ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingInv(null);
            }}
            initialData={editingInv || undefined}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => 
        !open && setDeleteConfirm(null)
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Investment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

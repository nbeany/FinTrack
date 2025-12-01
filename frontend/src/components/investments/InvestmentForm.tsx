import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Investment } from '@/lib/api';

interface InvestmentFormProps {
  onSubmit: (data: Omit<Investment, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Investment;
}

const ASSET_TYPES = ['stock', 'crypto', 'etf', 'bond', 'mutual_fund', 'other'];
const EXCHANGES = ['NASDAQ', 'NYSE', 'CRYPTO', 'LSE', 'Other'];

export function InvestmentForm({
  onSubmit,
  onCancel,
  initialData,
}: InvestmentFormProps) {
  const [assetType, setAssetType] = useState(initialData?.asset_type || '');
  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
  const [buyPrice, setBuyPrice] = useState(initialData?.buy_price?.toString() || '');
  const [exchange, setExchange] = useState(initialData?.exchange || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetType || !symbol || !quantity || !buyPrice || !exchange)
      return;

    setIsSubmitting(true);
    try {
      // Only send buy_price - current_price will be fetched automatically by backend
      await onSubmit({
        asset_type: assetType,
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        exchange,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Investment' : 'Add Investment'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetType">Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Select value={exchange} onValueChange={setExchange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map((ex) => (
                    <SelectItem key={ex} value={ex}>
                      {ex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.0001"
              min="0"
              placeholder="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price (per unit)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Current price will be fetched automatically from market data
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Investment } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProfitLossChartProps {
  investments: Investment[];
}

export function ProfitLossChart({ investments }: ProfitLossChartProps) {
  // Calculate profit/loss breakdown
  const profitLossData = (investments || [])
    .filter((inv) => inv && inv.symbol && inv.quantity != null && inv.buy_price != null && inv.current_price != null)
    .map((inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const buyPrice = typeof inv.buy_price === 'string' ? parseFloat(inv.buy_price) : Number(inv.buy_price) || 0;
      const currentPrice = typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price) || 0;
      
      const cost = quantity * buyPrice;
      const value = quantity * currentPrice;
      const profitLoss = value - cost;
      
      return {
        symbol: inv.symbol || 'N/A',
        cost: parseFloat(cost.toFixed(2)),
        value: parseFloat(value.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        isProfit: profitLoss >= 0,
      };
    })
    .sort((a, b) => Math.abs(b.profitLoss) - Math.abs(a.profitLoss))
    .slice(0, 8); // Top 8 investments

  if (profitLossData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No investment data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitLossData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis 
                dataKey="symbol" 
                stroke="hsl(222 13% 50%)"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(222 13% 50%)"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(grey 47% 9%)',
                  border: '1px solid hsl(blue 30% 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'profitLoss') {
                    const isPositive = value >= 0;
                    return [
                      <span className={cn(isPositive ? 'text-success' : 'text-destructive')}>
                        ${isPositive ? '+' : ''}{value.toFixed(2)}
                      </span>,
                      'Profit/Loss'
                    ];
                  }
                  return [`$${value.toFixed(2)}`, name];
                }}
              />
              <Bar 
                dataKey="profitLoss" 
                radius={[8, 8, 0, 0]}
                shape={(props: any) => {
                  const { payload, x, y, width, height } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={payload.isProfit ? 'hsl(160, 84%, 39%)' : 'hsl(15, 90%, 60%)'}
                      rx={8}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


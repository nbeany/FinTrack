import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Investment } from '@/lib/api';

interface InvestmentPerformanceChartProps {
  investments: Investment[];
}

export function InvestmentPerformanceChart({ investments }: InvestmentPerformanceChartProps) {
  // Calculate profit/loss for each investment
  const performanceData = (investments || [])
    .filter((inv) => inv && inv.symbol && inv.quantity != null && inv.buy_price != null && inv.current_price != null)
    .map((inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const buyPrice = typeof inv.buy_price === 'string' ? parseFloat(inv.buy_price) : Number(inv.buy_price) || 0;
      const currentPrice = typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price) || 0;
      
      const cost = quantity * buyPrice;
      const value = quantity * currentPrice;
      const profitLoss = value - cost;
      const profitLossPercent = cost > 0 ? ((profitLoss / cost) * 100) : 0;
      
      return {
        symbol: inv.symbol || 'N/A',
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
        value: parseFloat(value.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
      };
    })
    .sort((a, b) => b.profitLoss - a.profitLoss);

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Performance</CardTitle>
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
        <CardTitle>Investment Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'profitLoss') {
                    return [`$${value.toFixed(2)}`, 'Profit/Loss'];
                  }
                  if (name === 'profitLossPercent') {
                    return [`${value.toFixed(2)}%`, 'Return %'];
                  }
                  return [`$${value.toFixed(2)}`, name];
                }}
              />
              <Legend />
              <Bar 
                dataKey="profitLoss" 
                fill="hsl(160, 84%, 39%)"
                name="Profit/Loss"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


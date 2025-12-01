import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Transaction } from '@/lib/api';

interface SpendingChartProps {
  transactions: Transaction[];
}

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(15, 90%, 60%)',
  'hsl(200, 80%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 80%, 55%)',
];

export function SpendingChart({ transactions }: SpendingChartProps) {
  // Safely filter and process transactions
  const expenses = (transactions || [])
    .filter((tx) => tx && tx.type === 'expense' && tx.amount != null && tx.category);
  
  const categoryTotals = expenses.reduce((acc, tx) => {
    // Safely parse amount (handle string from DECIMAL type)
    const amount = typeof tx.amount === 'string' 
      ? parseFloat(tx.amount) 
      : Number(tx.amount) || 0;
    const category = tx.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expense data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(grey 47% 9%)',
                  border: '1px solid hsl(blue 30% 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

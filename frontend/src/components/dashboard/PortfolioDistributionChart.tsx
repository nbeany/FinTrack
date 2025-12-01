import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Investment } from '@/lib/api';

interface PortfolioDistributionChartProps {
  investments: Investment[];
}

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(200, 80%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(15, 90%, 60%)',
  'hsl(340, 80%, 55%)',
  'hsl(120, 70%, 50%)',
  'hsl(240, 70%, 60%)',
];

export function PortfolioDistributionChart({ investments }: PortfolioDistributionChartProps) {
  // Calculate portfolio distribution by asset type
  const distributionData = (investments || [])
    .filter((inv) => inv && inv.quantity != null && inv.current_price != null)
    .reduce((acc, inv) => {
      const quantity = typeof inv.quantity === 'string' ? parseFloat(inv.quantity) : Number(inv.quantity) || 0;
      const price = typeof inv.current_price === 'string' ? parseFloat(inv.current_price) : Number(inv.current_price) || 0;
      const value = quantity * price;
      const assetType = inv.asset_type || 'other';
      
      acc[assetType] = (acc[assetType] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

  const data = Object.entries(distributionData)
    .map(([name, value]) => ({ 
      name: name.replace('_', ' ').toUpperCase(), 
      value: parseFloat(value.toFixed(2)) 
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
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
        <CardTitle>Portfolio Distribution by Asset Type</CardTitle>
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
                formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
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


import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'primary',
  delay = 0,
}: StatCardProps) {
  const iconColorClasses = {
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  const changeColorClasses = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-border rounded-xl p-6 shadow-card hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className={cn('text-sm font-medium', changeColorClasses[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColorClasses[iconColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

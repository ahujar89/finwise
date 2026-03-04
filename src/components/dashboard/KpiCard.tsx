import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  color: string;
}

export function KpiCard({ title, value, subtext, icon: Icon, trend, trendLabel, color }: KpiCardProps) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            {trendLabel && (
              <p
                className={cn(
                  'text-xs font-medium mt-1',
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {trendLabel}
              </p>
            )}
          </div>
          <div className={cn('p-2.5 rounded-xl', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

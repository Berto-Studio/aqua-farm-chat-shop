
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  trendValue?: number;
  trendLabel?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  footer,
  className,
  trendValue,
  trendLabel
}: DashboardCardProps) {
  const isTrendPositive = trendValue && trendValue > 0;
  const isTrendNegative = trendValue && trendValue < 0;

  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-2xl font-bold text-foreground">{value}</div>
        </div>
        {icon && <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="flex items-center justify-between">
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
          {trendValue !== undefined && (
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  isTrendPositive && "text-green-700 bg-green-50",
                  isTrendNegative && "text-red-700 bg-red-50"
                )}
              >
                {isTrendPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {isTrendPositive && '+'}
                {trendValue}%
              </div>
              {trendLabel && (
                <div className="text-xs text-muted-foreground ml-1">
                  {trendLabel}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {footer && <CardFooter className="relative">{footer}</CardFooter>}
    </Card>
  );
}


import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        {trendValue !== undefined && (
          <div className="flex items-center mt-1">
            <div
              className={cn(
                "text-xs font-medium",
                isTrendPositive && "text-green-500",
                isTrendNegative && "text-red-500"
              )}
            >
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
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

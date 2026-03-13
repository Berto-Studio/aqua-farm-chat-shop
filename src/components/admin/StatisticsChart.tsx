import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartKind = "area" | "bar" | "line" | "composed";
type SeriesKind = "area" | "bar" | "line";

export interface StatisticsChartSeries {
  key: string;
  label: string;
  color: string;
  kind?: SeriesKind;
  stackId?: string;
  radius?: [number, number, number, number];
  strokeWidth?: number;
}

interface StatisticsChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: StatisticsChartSeries[];
  kind?: ChartKind;
  layout?: "horizontal" | "vertical";
  emptyMessage?: string;
  className?: string;
  contentClassName?: string;
  valueFormatter?: (value: number) => string;
}

const axisTick = { fontSize: 12, fill: "#64748b" };

const chartMargin = {
  top: 8,
  right: 8,
  left: -12,
  bottom: 0,
};

const defaultFormatValue = (value: number) => value.toLocaleString();

const getGradientId = (chartId: string, key: string) =>
  `${chartId}-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-gradient`;

export default function StatisticsChart({
  title,
  description,
  data,
  xKey,
  series,
  kind = "line",
  layout = "horizontal",
  emptyMessage = "No chart data available yet.",
  className,
  contentClassName,
  valueFormatter = defaultFormatValue,
}: StatisticsChartProps) {
  const rawId = useId();
  const chartId = rawId.replace(/:/g, "");

  const chartConfig = series.reduce<ChartConfig>((config, item) => {
    config[item.key] = {
      label: item.label,
      color: item.color,
    };
    return config;
  }, {});

  const renderTooltipValue = (value: unknown, name: string) => {
    const numericValue = Number(value);

    return (
      <div className="flex min-w-[140px] items-center gap-2">
        <span className="text-muted-foreground">{name}</span>
        <span className="ml-auto font-mono font-medium text-foreground">
          {Number.isFinite(numericValue)
            ? valueFormatter(numericValue)
            : String(value)}
        </span>
      </div>
    );
  };

  const renderSeries = () =>
    series.map((item) => {
      const seriesKind = item.kind || (kind === "composed" ? "line" : kind);

      if (seriesKind === "area") {
        const gradientId = getGradientId(chartId, item.key);

        return (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.label}
            stroke={`var(--color-${item.key})`}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            stackId={item.stackId}
            strokeWidth={item.strokeWidth || 2}
          />
        );
      }

      if (seriesKind === "bar") {
        return (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            fill={`var(--color-${item.key})`}
            radius={item.radius || [6, 6, 0, 0]}
            stackId={item.stackId}
          />
        );
      }

      return (
        <Line
          key={item.key}
          type="monotone"
          dataKey={item.key}
          name={item.label}
          stroke={`var(--color-${item.key})`}
          strokeWidth={item.strokeWidth || 3}
          dot={{ r: 3, fill: `var(--color-${item.key})` }}
          activeDot={{ r: 5 }}
        />
      );
    });

  const renderGradients = () =>
    series
      .filter((item) => (item.kind || kind) === "area")
      .map((item) => {
        const gradientId = getGradientId(chartId, item.key);

        return (
          <linearGradient
            key={gradientId}
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor={`var(--color-${item.key})`}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={`var(--color-${item.key})`}
              stopOpacity={0}
            />
          </linearGradient>
        );
      });

  const commonChartProps = {
    data,
    margin:
      layout === "vertical"
        ? { top: 8, right: 8, left: 24, bottom: 0 }
        : chartMargin,
  };

  const renderChart = () => {
    if (kind === "area") {
      return (
        <AreaChart {...commonChartProps}>
          <defs>{renderGradients()}</defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            minTickGap={20}
            tick={axisTick}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tick={axisTick}
            tickFormatter={(value) => valueFormatter(Number(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) =>
                  renderTooltipValue(value, String(name))
                }
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {renderSeries()}
        </AreaChart>
      );
    }

    if (kind === "bar") {
      return (
        <BarChart {...commonChartProps} layout={layout}>
          <CartesianGrid
            vertical={layout !== "vertical"}
            horizontal={layout === "vertical"}
            strokeDasharray="3 3"
          />
          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={axisTick}
                tickFormatter={(value) => valueFormatter(Number(value))}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                width={110}
                tick={axisTick}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={20}
                tick={axisTick}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={axisTick}
                tickFormatter={(value) => valueFormatter(Number(value))}
              />
            </>
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) =>
                  renderTooltipValue(value, String(name))
                }
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {renderSeries()}
        </BarChart>
      );
    }

    if (kind === "composed") {
      return (
        <ComposedChart {...commonChartProps}>
          <defs>{renderGradients()}</defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            minTickGap={20}
            tick={axisTick}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tick={axisTick}
            tickFormatter={(value) => valueFormatter(Number(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) =>
                  renderTooltipValue(value, String(name))
                }
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {renderSeries()}
        </ComposedChart>
      );
    }

    return (
      <LineChart {...commonChartProps}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          minTickGap={20}
          tick={axisTick}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={44}
          tick={axisTick}
          tickFormatter={(value) => valueFormatter(Number(value))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => renderTooltipValue(value, String(name))}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {renderSeries()}
      </LineChart>
    );
  };

  return (
    <Card className={cn("flex h-full min-h-[24rem] flex-col border shadow-sm", className)}>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("flex min-h-0 flex-1 p-0", contentClassName)}>
        {data.length === 0 ? (
          <div className="flex min-h-[18rem] flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-full min-h-[18rem] w-full aspect-auto px-4 pb-4 sm:px-6 sm:pb-6"
          >
            {renderChart()}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

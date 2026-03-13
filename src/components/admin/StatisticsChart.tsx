import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { name: "Jan", catfish: 4000, tilapia: 2400 },
  { name: "Feb", catfish: 3000, tilapia: 1398 },
  { name: "Mar", catfish: 2000, tilapia: 9800 },
  { name: "Apr", catfish: 2780, tilapia: 3908 },
  { name: "May", catfish: 1890, tilapia: 4800 },
  { name: "Jun", catfish: 2390, tilapia: 3800 },
  { name: "Jul", catfish: 3490, tilapia: 4300 },
];

interface StatisticsChartProps {
  title: string;
  description?: string;
}

const chartConfig = {
  catfish: {
    label: "Catfish",
    color: "hsl(var(--primary))",
  },
  tilapia: {
    label: "Tilapia",
    color: "#10b981",
  },
};

const axisTick = { fontSize: 12, fill: "#64748b" };

const chartMargin = {
  top: 8,
  right: 8,
  left: -20,
  bottom: 0,
};

export default function StatisticsChart({
  title,
  description,
}: StatisticsChartProps) {
  const [period, setPeriod] = useState("monthly");

  return (
    <Card className="flex h-full min-h-[32rem] flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
          <TabsList className="grid h-9 w-full grid-cols-3 bg-muted/30 sm:w-auto">
            <TabsTrigger value="weekly" className="text-xs">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <Tabs defaultValue="area" className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 justify-end px-4 sm:px-6">
            <TabsList className="grid h-9 w-full grid-cols-3 bg-muted/30 sm:w-auto">
              <TabsTrigger value="area" className="text-xs">
                Area
              </TabsTrigger>
              <TabsTrigger value="line" className="text-xs">
                Line
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs">
                Bar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="area"
            className="mt-0 min-h-0 flex-1 px-4 pb-4 pt-3 sm:px-6 sm:pb-6"
          >
            <ChartContainer
              config={chartConfig}
              className="h-full w-full min-h-[260px] aspect-auto overflow-hidden"
            >
              <AreaChart data={data} margin={chartMargin}>
                <defs>
                  <linearGradient
                    id="catfishGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="tilapiaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                  tickMargin={8}
                  tick={axisTick}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={axisTick}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="catfish"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="url(#catfishGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tilapia"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#tilapiaGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent
            value="line"
            className="mt-0 min-h-0 flex-1 px-4 pb-4 pt-3 sm:px-6 sm:pb-6"
          >
            <ChartContainer
              config={chartConfig}
              className="h-full w-full min-h-[260px] aspect-auto overflow-hidden"
            >
              <LineChart data={data} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                  tickMargin={8}
                  tick={axisTick}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={axisTick}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="catfish"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="tilapia"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent
            value="bar"
            className="mt-0 min-h-0 flex-1 px-4 pb-4 pt-3 sm:px-6 sm:pb-6"
          >
            <ChartContainer
              config={chartConfig}
              className="h-full w-full min-h-[260px] aspect-auto overflow-hidden"
            >
              <BarChart data={data} barCategoryGap="20%" margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                  tickMargin={8}
                  tick={axisTick}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={axisTick}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="catfish"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="tilapia" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

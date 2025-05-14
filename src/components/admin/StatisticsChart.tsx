
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

export default function StatisticsChart({ title, description }: StatisticsChartProps) {
  const [period, setPeriod] = useState("monthly");

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Tabs defaultValue="monthly" onValueChange={setPeriod}>
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="line" className="h-[350px]">
          <div className="flex justify-end px-4">
            <TabsList className="grid grid-cols-2 h-8 w-auto">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="line" className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="catfish"
                  stroke="#1B5E20"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="tilapia" stroke="#333333" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="bar" className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="catfish" fill="#1B5E20" />
                <Bar dataKey="tilapia" fill="#333333" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ScoreDistribution } from "@/lib/admin-api";

interface ScoreDistributionChartProps {
  data: ScoreDistribution[];
}

const STATUS_COLORS: Record<string, string> = {
  Excellent: "#22C55E",
  Good: "#3B82F6",
  "Needs Improvement": "#F59E0B",
  "At Risk": "#EF4444",
};

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  // Ensure data is always an array
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Financial health status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.status}</p>
                          <p className="text-sm">Count: {data.count}</p>
                          <p className="text-sm">
                            Percentage: {data.percentage.toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || "#1B365D"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {chartData.map((item) => (
                <div key={item.status} className="text-center">
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{
                      backgroundColor: STATUS_COLORS[item.status] || "#1B365D",
                    }}
                  />
                  <p className="text-xs font-medium">{item.status}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

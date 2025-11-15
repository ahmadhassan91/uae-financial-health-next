import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AgeBreakdown } from '@/lib/admin-api';

interface AgeBreakdownChartProps {
  data: AgeBreakdown[];
}

const AGE_GROUP_COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AgeBreakdownChart({ data }: AgeBreakdownChartProps) {
  // Sort data by age group order
  const chartData = Array.isArray(data) ? data : [];
  const sortedData = [...chartData].sort((a, b) => {
    const order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    return order.indexOf(a.age_group) - order.indexOf(b.age_group);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Breakdown</CardTitle>
        <CardDescription>Participation and performance by age group</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age_group" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.age_group}</p>
                      <p className="text-sm">Total: {data.total}</p>
                      <p className="text-sm">Avg Score: {data.average_score.toFixed(1)}</p>
                      <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="total" name="Total Submissions" radius={[8, 8, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={AGE_GROUP_COLORS[index % AGE_GROUP_COLORS.length]} />
              ))}
            </Bar>
            <Bar
              yAxisId="right"
              dataKey="average_score"
              name="Avg Score"
              fill="#D4AF37"
              radius={[8, 8, 0, 0]}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {sortedData.map((item, index) => (
            <div key={item.age_group} className="border rounded-lg p-3 text-center">
              <div
                className="w-4 h-4 rounded-full mx-auto mb-1"
                style={{ backgroundColor: AGE_GROUP_COLORS[index % AGE_GROUP_COLORS.length] }}
              />
              <p className="text-xs font-medium">{item.age_group}</p>
              <p className="text-lg font-bold">{item.total}</p>
              <p className="text-xs text-muted-foreground">
                Avg: {item.average_score.toFixed(1)}
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

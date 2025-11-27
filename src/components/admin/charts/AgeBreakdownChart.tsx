import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { AgeBreakdown } from '@/lib/admin-api';
import { getOrderedAgeGroups, formatDecimal } from '@/lib/chart-utils';

interface AgeBreakdownChartProps {
  data: AgeBreakdown[];
}

const AGE_GROUP_COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AgeBreakdownChart({ data }: AgeBreakdownChartProps) {
  // Sort data by new age group order
  const chartData = Array.isArray(data) ? data : [];
  const orderedGroups = getOrderedAgeGroups();
  const sortedData = [...chartData].sort((a, b) => {
    return orderedGroups.indexOf(a.age_group) - orderedGroups.indexOf(b.age_group);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Breakdown</CardTitle>
        <CardDescription>Average performance by age group</CardDescription>
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
                <YAxis domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.age_group}</p>
                          <p className="text-sm">Total: {data.total}</p>
                          <p className="text-sm">Avg Score: {formatDecimal(data.average_score)}</p>
                          <p className="text-sm">Percentage: {formatDecimal(data.percentage)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="average_score" name="Avg Score" fill="#D4AF37" radius={[8, 8, 0, 0]}>
                  <LabelList
                    dataKey="average_score"
                    position="top"
                    fontSize={12}
                    formatter={(value: number) => formatDecimal(value)}
                  />
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_GROUP_COLORS[index % AGE_GROUP_COLORS.length]} />
                  ))}
                </Bar>
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
                    Avg: {formatDecimal(item.average_score)}
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

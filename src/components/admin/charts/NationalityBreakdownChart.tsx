import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { NationalityBreakdown } from '@/lib/admin-api';
import { formatDecimal } from '@/lib/chart-utils';

interface NationalityBreakdownChartProps {
  data: NationalityBreakdown[];
}

export function NationalityBreakdownChart({ data }: NationalityBreakdownChartProps) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nationality Breakdown</CardTitle>
        <CardDescription>Total submissions and average scores by nationality</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nationality" interval={0} />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-2">{data.nationality}</p>
                          <p className="text-sm">Total: {data.total}</p>
                          <p className="text-sm">Avg Score: {formatDecimal(data.average_score)}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-600">✓ Excellent: {data.excellent}</p>
                            <p className="text-xs text-blue-600">✓ Good: {data.good}</p>
                            <p className="text-xs text-yellow-600">⚠ Needs Improvement: {data.needs_improvement}</p>
                            <p className="text-xs text-red-600">✗ At Risk: {data.at_risk}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#1B365D" name="Total Submissions" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="total" position="top" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {chartData.map((item) => (
                <div key={item.nationality} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">{item.nationality}</p>
                    <p className="text-sm text-muted-foreground">Total: {item.total}</p>
                  </div>
                  <p className="text-2xl font-bold mb-2">Avg: {formatDecimal(item.average_score)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-green-600">Excellent: {item.excellent}</p>
                      <p className="text-blue-600">Good: {item.good}</p>
                    </div>
                    <div>
                      <p className="text-yellow-600">Needs Imp: {item.needs_improvement}</p>
                      <p className="text-red-600">At Risk: {item.at_risk}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

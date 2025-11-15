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
} from 'recharts';
import { NationalityBreakdown } from '@/lib/admin-api';

interface NationalityBreakdownChartProps {
  data: NationalityBreakdown[];
}

export function NationalityBreakdownChart({ data }: NationalityBreakdownChartProps) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nationality Breakdown</CardTitle>
        <CardDescription>Score status distribution by nationality</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nationality" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.nationality}</p>
                      <p className="text-sm">Total: {data.total}</p>
                      <p className="text-sm">Avg Score: {data.average_score.toFixed(1)}</p>
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
            <Bar dataKey="excellent" stackId="a" fill="#22C55E" name="Excellent" />
            <Bar dataKey="good" stackId="a" fill="#3B82F6" name="Good" />
            <Bar dataKey="needs_improvement" stackId="a" fill="#F59E0B" name="Needs Improvement" />
            <Bar dataKey="at_risk" stackId="a" fill="#EF4444" name="At Risk" />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.nationality} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{item.nationality}</p>
                <p className="text-sm text-muted-foreground">Total: {item.total}</p>
              </div>
              <p className="text-2xl font-bold mb-2">Avg: {item.average_score.toFixed(1)}</p>
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

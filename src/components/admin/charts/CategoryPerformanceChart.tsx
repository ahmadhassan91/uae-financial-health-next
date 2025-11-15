import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CategoryPerformance } from '@/lib/admin-api';

interface CategoryPerformanceChartProps {
  data: CategoryPerformance[];
}

const CATEGORY_COLORS = ['#1B365D', '#D4AF37', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

// Helper to format category names for display
const formatCategoryName = (category: string): string => {
  const nameMap: Record<string, string> = {
    'income_stream': 'Income Stream',
    'savings_habit': 'Savings Habit',
    'emergency_savings': 'Emergency Savings',
    'debt_management': 'Debt Management',
    'retirement_planning': 'Retirement Planning',
    'financial_protection': 'Financial Protection',
    'financial_knowledge': 'Financial Knowledge'
  };
  return nameMap[category] || category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function CategoryPerformanceChart({ data }: CategoryPerformanceChartProps) {
  const chartData = Array.isArray(data) ? data.map(item => ({
    ...item,
    displayName: formatCategoryName(item.category)
  })) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Average scores across 6 financial health categories</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="displayName" width={150} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.displayName}</p>
                      <p className="text-sm">Score: {data.average_score.toFixed(1)}</p>
                      <p className="text-sm">Max: {data.max_possible}</p>
                      <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" name="Percentage" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {chartData.map((item, index) => (
            <div key={item.category} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <p className="text-xs font-medium truncate">{item.displayName}</p>
              </div>
              <p className="text-lg font-bold">
                {item.average_score.toFixed(1)} / {item.max_possible}
              </p>
              <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}

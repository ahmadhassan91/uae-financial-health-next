import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';

interface NationalityPieChartProps {
    data: {
        nationality: string;
        count: number;
    }[];
}

const COLORS = {
    Emirati: '#1B365D',
    'Non-Emirati': '#D4AF37',
};

export function NationalityPieChart({ data }: NationalityPieChartProps) {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    const chartData = data.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0',
    }));

    const renderCustomLabel = (entry: any) => {
        return `${entry.percentage}%`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>UAE vs Non-Emirati</CardTitle>
                <CardDescription>Nationality distribution</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.nationality as keyof typeof COLORS] || '#9CA3AF'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                    <p className="font-semibold">{data.nationality}</p>
                                                    <p className="text-sm">Count: {data.count}</p>
                                                    <p className="text-sm">Percentage: {data.percentage}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {chartData.map((item) => (
                                <div key={item.nationality} className="border rounded-lg p-4 text-center">
                                    <div
                                        className="w-4 h-4 rounded-full mx-auto mb-2"
                                        style={{ backgroundColor: COLORS[item.nationality as keyof typeof COLORS] || '#9CA3AF' }}
                                    />
                                    <p className="font-semibold">{item.nationality}</p>
                                    <p className="text-2xl font-bold">{item.count}</p>
                                    <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

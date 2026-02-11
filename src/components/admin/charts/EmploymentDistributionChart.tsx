import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell,
} from 'recharts';

interface EmploymentDistributionChartProps {
    data: {
        status: string;
        count: number;
    }[];
}

const COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

export function EmploymentDistributionChart({ data }: EmploymentDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Employment Status</CardTitle>
                <CardDescription>Distribution by employment status</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="status" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.status}</p>
                                                <p className="text-sm">Count: {data.count}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                <LabelList dataKey="count" position="right" fontSize={12} />
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

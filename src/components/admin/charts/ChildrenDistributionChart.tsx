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

interface ChildrenDistributionChartProps {
    data: {
        count_label: string;
        count: number;
    }[];
}

const COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export function ChildrenDistributionChart({ data }: ChildrenDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Children</CardTitle>
                <CardDescription>Number of children per participant</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="count_label" />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.count_label}</p>
                                                <p className="text-sm">Count: {data.count}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                <LabelList dataKey="count" position="top" fontSize={12} />
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

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

interface EmirateDistributionChartProps {
    data: {
        emirate: string;
        count: number;
    }[];
}

const COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function EmirateDistributionChart({ data }: EmirateDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Emirate Distribution</CardTitle>
                <CardDescription>Participants by Emirate</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="emirate" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.emirate}</p>
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

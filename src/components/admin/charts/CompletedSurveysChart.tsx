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
} from 'recharts';
import { formatChartDate } from '@/lib/chart-utils';

interface CompletedSurveysChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

export function CompletedSurveysChart({ data }: CompletedSurveysChartProps) {
    // Format dates for display
    const chartData = data.map(item => ({
        ...item,
        formattedDate: formatChartDate(item.date),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Number of Completed Surveys</CardTitle>
                <CardDescription>Daily survey completion trend</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="formattedDate"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.formattedDate}</p>
                                                <p className="text-sm">Completed: {data.count}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" fill="#1B365D" radius={[8, 8, 0, 0]}>
                                <LabelList dataKey="count" position="top" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

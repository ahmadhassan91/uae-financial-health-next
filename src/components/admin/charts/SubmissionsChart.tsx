import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { TimeSeriesData } from '@/lib/admin-api';
import { formatChartDate, formatDecimal } from '@/lib/chart-utils';

interface SubmissionsChartProps {
    data: TimeSeriesData[];
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
    onGroupByChange: (groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
}

export function SubmissionsChart({ data, groupBy, onGroupByChange }: SubmissionsChartProps) {
    // Format data with formatted dates
    const chartData = Array.isArray(data) ? data.map(item => ({
        ...item,
        formattedPeriod: formatChartDate(item.period)
    })) : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Submissions Over Time</CardTitle>
                        <CardDescription>Track submission counts over time</CardDescription>
                    </div>
                    <Select value={groupBy} onValueChange={(value: any) => onGroupByChange(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                            <SelectItem value="quarter">Quarterly</SelectItem>
                            <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="formattedPeriod"
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
                                                <p className="font-semibold">{data.formattedPeriod}</p>
                                                <p className="text-sm">Submissions: {data.submissions}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="submissions"
                                fill="#1B365D"
                                name="Submissions"
                                radius={[4, 4, 0, 0]}
                            >
                                <LabelList dataKey="submissions" position="top" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

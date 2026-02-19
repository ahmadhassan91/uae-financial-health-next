import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    LineChart,
    Line,
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

interface AverageScoreChartProps {
    data: TimeSeriesData[];
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
    onGroupByChange: (groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
}

export function AverageScoreChart({ data, groupBy, onGroupByChange }: AverageScoreChartProps) {
    // Format data with formatted dates
    const chartData = Array.isArray(data) ? data.map(item => ({
        ...item,
        formattedPeriod: formatChartDate(item.period),
        formattedScore: Math.round(item.average_score)
    })) : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Average Score Over Time</CardTitle>
                        <CardDescription>Track average performance scores over time</CardDescription>
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
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="formattedPeriod"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.formattedPeriod}</p>
                                                <p className="text-sm">Avg Score: {Math.round(data.average_score)}</p>
                                                <p className="text-xs text-muted-foreground">{data.submissions} submissions</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="formattedScore"
                                stroke="#D4AF37"
                                strokeWidth={3}
                                name="Avg Score"
                                dot={{ fill: '#D4AF37', r: 5 }}
                                activeDot={{ r: 7 }}
                            >
                                <LabelList
                                    dataKey="formattedScore"
                                    position="top"
                                    fontSize={12}
                                    formatter={(value: number) => Math.round(value)}
                                />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

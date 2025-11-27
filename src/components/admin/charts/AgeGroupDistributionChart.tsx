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
import { getOrderedAgeGroups } from '@/lib/chart-utils';

interface AgeGroupDistributionChartProps {
    data: {
        age_group: string;
        count: number;
    }[];
}

const AGE_GROUP_COLORS = ['#1B365D', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AgeGroupDistributionChart({ data }: AgeGroupDistributionChartProps) {
    // Sort by age group order
    const orderedGroups = getOrderedAgeGroups();
    const sortedData = [...data].sort((a, b) => {
        return orderedGroups.indexOf(a.age_group) - orderedGroups.indexOf(b.age_group);
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Age Group Distribution</CardTitle>
                <CardDescription>Participation by age group</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sortedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age_group" />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold">{data.age_group}</p>
                                                <p className="text-sm">Count: {data.count}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                <LabelList dataKey="count" position="top" fontSize={12} />
                                {sortedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={AGE_GROUP_COLORS[index % AGE_GROUP_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

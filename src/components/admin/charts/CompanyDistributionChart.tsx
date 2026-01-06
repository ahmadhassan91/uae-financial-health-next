import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
    Label,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

interface CompanyDistributionChartProps {
    data: {
        company: string;
        total_submissions: number;
        average_score: number;
    }[];
}

const COLORS = [
    '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#A855F7', '#22D3EE', '#FACC15', '#FB923C',
];

export function CompanyDistributionChart({ data }: CompanyDistributionChartProps) {
    const total = data.reduce((sum, item) => sum + item.total_submissions, 0);

    // For pie chart - show top 10 companies, group others as "Others"
    const sortedData = [...data].sort((a, b) => b.total_submissions - a.total_submissions);
    const topCompanies = sortedData.slice(0, 9);
    const othersCount = sortedData.slice(9).reduce((sum, item) => sum + item.total_submissions, 0);
    
    const pieData = topCompanies.map(item => ({
        company: item.company,
        count: item.total_submissions,
        percentage: total > 0 ? ((item.total_submissions / total) * 100).toFixed(1) : '0.0',
    }));

    if (othersCount > 0) {
        pieData.push({
            company: 'Others',
            count: othersCount,
            percentage: total > 0 ? ((othersCount / total) * 100).toFixed(1) : '0.0',
        });
    }

    // For bar chart - show top 10 companies by submissions
    const barData = topCompanies.map(item => ({
        company: item.company.length > 15 ? item.company.substring(0, 15) + '...' : item.company,
        submissions: item.total_submissions,
        avgScore: item.average_score,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{payload[0].payload.company}</p>
                    <p className="text-sm text-gray-600">Submissions: {payload[0].value}</p>
                    <p className="text-sm text-gray-600">Percentage: {payload[0].payload.percentage}%</p>
                </div>
            );
        }
        return null;
    };

    const BarTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{payload[0].payload.company}</p>
                    <p className="text-sm text-gray-600">Submissions: {payload[0].value}</p>
                    <p className="text-sm text-gray-600">Avg Score: {payload[0].payload.avgScore.toFixed(1)}</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Company / Employer</CardTitle>
                    <CardDescription>
                        Distribution of submissions across companies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        No company data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Company / Employer</CardTitle>
                    <CardDescription>
                        Percentage of submissions by company (Top 10 shown)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) => `${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                formatter={(value, entry: any) => `${entry.payload.company} (${value})`}
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Companies by Submissions</CardTitle>
                    <CardDescription>
                        Number of submissions per company (Top 10)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="company" 
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip content={<BarTooltip />} />
                            <Bar dataKey="submissions" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

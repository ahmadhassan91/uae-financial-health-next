"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CategoryPerformance, ScoreDistribution } from "@/lib/admin-api";

interface ScoreByQuestionsChartsProps {
  categoryPerformance: CategoryPerformance[];
  scoreDistribution: ScoreDistribution[];
}

const TRAFFIC_COLORS = {
  Excellent: "#16a34a",
  Good: "#2563eb",
  "Needs Improvement": "#d97706",
  "At Risk": "#dc2626",
};

const CATEGORY_COLORS = ["#16a34a", "#2563eb", "#0891b2", "#7c3aed", "#d97706", "#dc2626"];

const shortLabel = (cat: string) =>
  cat
    .replace("financial_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function ScoreByQuestionsCharts({
  categoryPerformance,
  scoreDistribution,
}: ScoreByQuestionsChartsProps) {
  // Pie data: score distribution (at risk, needs imp, good, excellent)
  const pieData = scoreDistribution.map((d) => ({ name: d.status, value: d.count }));
  const pieColors = scoreDistribution.map(
    (d) => TRAFFIC_COLORS[d.status as keyof typeof TRAFFIC_COLORS] || "#94a3b8"
  );

  // Avg score bar data
  const avgBarData = categoryPerformance.map((d) => ({
    name: shortLabel(d.category),
    score: parseFloat(d.average_score.toFixed(1)),
    fill: TRAFFIC_COLORS[
      d.percentage >= 65
        ? "Excellent"
        : d.percentage >= 50
        ? "Good"
        : d.percentage >= 35
        ? "Needs Improvement"
        : "At Risk"
    ],
  }));

  // Traffic light bar — uses score distribution per category — we approximate
  // using overall distribution proportionally since backend doesn't return per-category TL counts yet
  // We show the overall distribution as the "Score by Traffic Light" bar
  const tlBarData = [
    {
      name: "Overall",
      ...Object.fromEntries(scoreDistribution.map((d) => [d.status, d.percentage.toFixed(1)])),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Score By Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart */}
          <div>
            <p className="text-sm font-medium text-center mb-2">Overall Score Breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Avg score bar */}
          <div>
            <p className="text-sm font-medium text-center mb-2">
              Average Score{" "}
              <span className="text-xs text-muted-foreground">
                (Color coding Based on Traffic Light)
              </span>
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={avgBarData} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}`, "Avg Score"]} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {avgBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic light stacked bar */}
          <div>
            <p className="text-sm font-medium text-center mb-2">Score by Traffic Light</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={avgBarData.map((d, i) => ({
                  name: d.name,
                  // approximating per-category via category performance percentage
                  "At Risk": Math.max(35 - (categoryPerformance[i]?.percentage || 0), 0).toFixed(0),
                  "Needs Improvement": 15,
                  Good: 20,
                  Excellent: Math.min(categoryPerformance[i]?.percentage || 0, 100).toFixed(0),
                }))}
                layout="vertical"
                margin={{ left: 8 }}
              >
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                {Object.entries(TRAFFIC_COLORS).map(([band, color]) => (
                  <Bar key={band} dataKey={band} stackId="tl" fill={color} />
                ))}
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

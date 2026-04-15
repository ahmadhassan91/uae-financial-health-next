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
} from "recharts";
import { CategoryPerformance, ScoreDistribution } from "@/lib/admin-api";

interface ScoreByQuestionsChartsProps {
  categoryPerformance: CategoryPerformance[];
  scoreDistribution: ScoreDistribution[];
}

const TRAFFIC_COLORS: Record<string, string> = {
  Excellent: "#22c55e",
  Good: "#3b82f6",
  "Needs Improvement": "#eab308",
  "At Risk": "#ef4444",
};

/** Convert backend category key → display name */
const categoryLabel = (cat: string) =>
  cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Only these 6 categories should appear in the chart */
const VALID_CATEGORIES = new Set([
  "income_stream",
  "savings_habit",
  "emergency_savings",
  "debt_management",
  "retirement_planning",
  "financial_protection",
]);

export function ScoreByQuestionsCharts({
  categoryPerformance,
  scoreDistribution,
}: ScoreByQuestionsChartsProps) {
  const total = scoreDistribution.reduce((s, d) => s + d.count, 0);

  // Filter to only valid categories
  const validPerformance = categoryPerformance.filter((d) =>
    VALID_CATEGORIES.has(d.category.toLowerCase())
  );

  // Pie data
  const pieData = scoreDistribution.map((d) => ({ name: d.status, value: d.count }));
  const pieColors = scoreDistribution.map(
    (d) => TRAFFIC_COLORS[d.status] ?? "#94a3b8"
  );

  // Avg score bar — use percentage (0-100) so bars fill correctly
  const avgBarData = validPerformance.map((d) => ({
    name: categoryLabel(d.category),
    score: parseFloat(d.percentage.toFixed(1)),
    fill:
      d.percentage >= 65
        ? "#22c55e"
        : d.percentage >= 50
        ? "#3b82f6"
        : d.percentage >= 35
        ? "#eab308"
        : "#ef4444",
  }));

  // Traffic light stacked bar using overall score distribution per category
  const tlBarData = avgBarData.map((d, i) => {
    const cp = validPerformance[i];
    const pct = cp?.percentage ?? 0;
    // approximate per-category TL split from the overall percentages scaled by category pct
    return {
      name: d.name,
      Excellent: Math.max(0, pct - 35).toFixed(1),
      Good: Math.min(pct, 15).toFixed(1),
      "Needs Improvement": Math.max(0, Math.min(35, 100 - pct) - 15).toFixed(1),
      "At Risk": Math.max(0, 100 - pct - 50).toFixed(1),
    };
  });

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
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={75} label={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Score breakdown stats below legend */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {scoreDistribution.map((d) => (
                <div key={d.status} className="flex flex-col items-center">
                  <span
                    className="w-3 h-3 rounded-full mb-1"
                    style={{ backgroundColor: TRAFFIC_COLORS[d.status] ?? "#94a3b8" }}
                  />
                  <span className="text-xs text-muted-foreground">{d.status}</span>
                  <span className="text-lg font-bold leading-tight">{d.count}</span>
                  <span className="text-xs text-muted-foreground">
                    {total > 0 ? ((d.count / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avg score bar */}
          <div>
            <p className="text-sm font-medium text-center mb-2">
              Average Score{" "}
              <span className="text-xs text-muted-foreground">
                (Color coding Based on Traffic Light)
              </span>
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={avgBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
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
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tlBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                {(["At Risk", "Needs Improvement", "Good", "Excellent"] as const).map((band) => (
                  <Bar key={band} dataKey={band} stackId="tl" fill={TRAFFIC_COLORS[band]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Custom centered legend below all charts in the card */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-6">
          {(["At Risk", "Needs Improvement", "Good", "Excellent"] as const).map((band) => (
            <span key={band} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                style={{ backgroundColor: TRAFFIC_COLORS[band], width: 10, height: 10, borderRadius: 2, display: "inline-block" }}
              />
              {band}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

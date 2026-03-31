"use client";

/**
 * Reusable pair of charts:
 *  Left:  Horizontal bar — Average Score per group (colour-coded by traffic light)
 *  Right: Horizontal stacked bar — Score by Traffic Light (%) per group
 *
 * Used by ScoreByAgeGroupCharts, ScoreByEmirateCharts,
 *         ScoreByIncomeRangeCharts, ScoreByChildrenCharts
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

export interface GroupRow {
  label: string;
  count: number;
  average_score: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
}

interface ScoreByGroupChartsProps {
  title: string;
  data: GroupRow[];
}

const TRAFFIC_COLORS = {
  "At Risk": "#ef4444",
  "Needs Improvement": "#eab308",
  Good: "#3b82f6",
  Excellent: "#22c55e",
};

const bandColor = (score: number) => {
  if (score >= 65) return "#22c55e";
  if (score >= 50) return "#3b82f6";
  if (score >= 35) return "#eab308";
  return "#ef4444";
};

export function ScoreByGroupCharts({ title, data }: ScoreByGroupChartsProps) {
  const avgData = data.map((d) => ({
    name: d.label,
    score: parseFloat(d.average_score.toFixed(1)),
    fill: bandColor(d.average_score),
  }));

  const tlData = data.map((d) => {
    const total = d.excellent + d.good + d.needs_improvement + d.at_risk || 1;
    return {
      name: d.label,
      Excellent: parseFloat(((d.excellent / total) * 100).toFixed(1)),
      Good: parseFloat(((d.good / total) * 100).toFixed(1)),
      "Needs Improvement": parseFloat(((d.needs_improvement / total) * 100).toFixed(1)),
      "At Risk": parseFloat(((d.at_risk / total) * 100).toFixed(1)),
    };
  });

  const barHeight = Math.max(data.length * 32 + 40, 180);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Average Score bar */}
          <div>
            <p className="text-xs text-muted-foreground text-center mb-2">
              Average Score{" "}
              <span className="italic">(Color coding Based on Traffic Light)</span>
            </p>
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart data={avgData} layout="vertical" margin={{ left: 4 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}`, "Avg Score"]} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {avgData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic light stacked bar */}
          <div>
            <p className="text-xs text-muted-foreground text-center mb-2">
              Score by Traffic Light
            </p>
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart data={tlData} layout="vertical" margin={{ left: 4 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                {(Object.keys(TRAFFIC_COLORS) as (keyof typeof TRAFFIC_COLORS)[]).map((band) => (
                  <Bar key={band} dataKey={band} stackId="tl" fill={TRAFFIC_COLORS[band]} />
                ))}
                <Legend
                  iconSize={10}
                  formatter={(v) => <span className="text-xs">{v}</span>}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

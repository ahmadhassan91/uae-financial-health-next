"use client";

import React from "react";
import { ScoreByGroupCharts } from "./ScoreByGroupCharts";

interface ChildrenRow {
  count_label: string;
  count: number;
  average_score: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
}

interface ScoreByChildrenChartsProps {
  data: ChildrenRow[];
}

export function ScoreByChildrenCharts({ data }: ScoreByChildrenChartsProps) {
  const rows = data.map((d) => ({
    label: d.count_label,
    count: d.count,
    average_score: d.average_score,
    excellent: d.excellent,
    good: d.good,
    needs_improvement: d.needs_improvement,
    at_risk: d.at_risk,
  }));

  return <ScoreByGroupCharts title="Overall Score By Married with Kids" data={rows} />;
}

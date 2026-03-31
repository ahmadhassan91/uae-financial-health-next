"use client";

import React from "react";
import { ScoreByGroupCharts } from "./ScoreByGroupCharts";

interface IncomeRow {
  range: string;
  count: number;
  average_score: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
}

interface ScoreByIncomeRangeChartsProps {
  data: IncomeRow[];
}

// Shorten income labels to fit on chart axes
const short = (label: string) =>
  label
    .replace("Below AED ", "<")
    .replace("Above AED ", ">")
    .replace("AED ", "")
    .replace(" to AED ", "-")
    .replace(",000", "k");

export function ScoreByIncomeRangeCharts({ data }: ScoreByIncomeRangeChartsProps) {
  const rows = data.map((d) => ({
    label: short(d.range),
    count: d.count,
    average_score: d.average_score,
    excellent: d.excellent,
    good: d.good,
    needs_improvement: d.needs_improvement,
    at_risk: d.at_risk,
  }));

  return <ScoreByGroupCharts title="Overall Score By Income Range" data={rows} />;
}

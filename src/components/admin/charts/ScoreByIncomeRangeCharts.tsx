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

// Shorten income labels — use regex /g to replace ALL occurrences of ,000
const short = (label: string) =>
  label
    .replace("Below AED ", "<")
    .replace("Above AED ", ">")
    .replace(/AED /g, "")
    .replace(/ to /g, "-")
    .replace(/,000/g, "k");

// Ascending income order (lowest → highest at bottom of chart = first in data for horiz bars)
const INCOME_ORDER: Record<string, number> = {
  "Below AED 5,000": 1,
  "AED 5,000 to AED 10,000": 2,
  "AED 10,000 to AED 20,000": 3,
  "AED 20,000 to AED 30,000": 4,
  "AED 30,000 to AED 40,000": 5,
  "AED 40,000 to AED 50,000": 6,
  "AED 50,000 to AED 100,000": 7,
  "Above AED 100,000": 8,
};

export function ScoreByIncomeRangeCharts({ data }: ScoreByIncomeRangeChartsProps) {
  // Sort ascending so lowest income shows at top of horizontal chart
  const sorted = [...data].sort(
    (a, b) => (INCOME_ORDER[a.range] ?? 99) - (INCOME_ORDER[b.range] ?? 99)
  );

  const rows = sorted.map((d) => ({
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

"use client";

import React from "react";
import { ScoreByGroupCharts } from "./ScoreByGroupCharts";

interface EmirateRow {
  emirate: string;
  count: number;
  average_score: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
}

interface ScoreByEmirateChartsProps {
  data: EmirateRow[];
}

export function ScoreByEmirateCharts({ data }: ScoreByEmirateChartsProps) {
  const rows = data.map((d) => ({
    label: d.emirate,
    count: d.count,
    average_score: d.average_score,
    excellent: d.excellent,
    good: d.good,
    needs_improvement: d.needs_improvement,
    at_risk: d.at_risk,
  }));

  return <ScoreByGroupCharts title="Overall Score By Emirates Group" data={rows} />;
}

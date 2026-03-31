"use client";

import React from "react";
import { AgeBreakdown } from "@/lib/admin-api";
import { ScoreByGroupCharts } from "./ScoreByGroupCharts";

interface ScoreByAgeGroupChartsProps {
  data: AgeBreakdown[];
}

export function ScoreByAgeGroupCharts({ data }: ScoreByAgeGroupChartsProps) {
  const rows = data.map((d) => ({
    label: d.age_group,
    count: d.total,
    average_score: d.average_score,
    excellent: d.excellent,
    good: d.good,
    needs_improvement: d.needs_improvement,
    at_risk: d.at_risk,
  }));

  return <ScoreByGroupCharts title="Overall Score By Age Group" data={rows} />;
}

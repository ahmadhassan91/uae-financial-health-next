import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { ScoreCalculation } from '@/lib/types';
import { PILLAR_DEFINITIONS } from '@/lib/survey-data';
import { calculatePillarPercentage, isValidPillarScore } from '@/lib/score-display-utils';

interface PillarHistogramProps {
  data: ScoreCalculation[];
  title?: string;
  description?: string;
}

interface PillarHistogramData {
  pillar: string;
  average: number;
  count: number;
  distribution: {
    excellent: number;
    good: number;
    needsImprovement: number;
    atRisk: number;
  };
}

export function PillarHistogram({ data, title = "Pillar Performance", description = "Average scores across financial pillars" }: PillarHistogramProps) {
  // Calculate pillar statistics using shared utilities
  const pillarData: PillarHistogramData[] = Object.entries(PILLAR_DEFINITIONS).map(([pillarKey, pillarDef]) => {
    const pillarScores = data
      .map(score => score.pillarScores?.find(p => p.pillar === pillarKey))
      .filter(pillar => pillar && isValidPillarScore(pillar))
      .map(pillar => pillar!.score);

    const average = pillarScores.length > 0 
      ? Number((pillarScores.reduce((sum, score) => sum + score, 0) / pillarScores.length).toFixed(1))
      : 0;

    // Calculate distribution
    const distribution = {
      excellent: pillarScores.filter(score => score >= 4).length,
      good: pillarScores.filter(score => score >= 3 && score < 4).length,
      needsImprovement: pillarScores.filter(score => score >= 2 && score < 3).length,
      atRisk: pillarScores.filter(score => score < 2).length
    };

    return {
      pillar: pillarDef.name,
      average,
      count: pillarScores.length,
      distribution
    };
  });

  // Colors for different performance levels
  const getBarColor = (average: number) => {
    if (average >= 4) return '#22C55E'; // Green - Excellent
    if (average >= 3) return '#3B82F6'; // Blue - Good
    if (average >= 2) return '#F59E0B'; // Orange - Needs Improvement
    return '#EF4444'; // Red - At Risk
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ payload: PillarHistogramData }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PillarHistogramData;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Average Score: <span className="font-medium">{data.average}/5.0</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total Responses: <span className="font-medium">{data.count}</span>
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">Excellent (4-5):</span>
              <span>{data.distribution.excellent}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-600">Good (3-4):</span>
              <span>{data.distribution.good}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-orange-600">Needs Improvement (2-3):</span>
              <span>{data.distribution.needsImprovement}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-600">At Risk (0-2):</span>
              <span>{data.distribution.atRisk}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={pillarData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="pillar" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 5]}
              tickCount={6}
              label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
              {pillarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Performance Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Excellent (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Good (3-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Needs Improvement (2-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>At Risk (0-2)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
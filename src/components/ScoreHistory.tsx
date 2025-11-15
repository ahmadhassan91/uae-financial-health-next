import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, ChartLineUp, ChartLineDown } from '@phosphor-icons/react';
import { ScoreCalculation } from '../lib/types';
import { PILLAR_DEFINITIONS } from '../lib/survey-data';
import { calculatePillarPercentage, getPillarDisplayData, isValidPillarScore } from '../lib/score-display-utils';

interface ScoreHistoryProps {
  scoreHistory: ScoreCalculation[];
  onBack: () => void;
  onLogout?: () => void;
  userEmail?: string;
}

export function ScoreHistory({ scoreHistory, onBack, onLogout, userEmail }: ScoreHistoryProps) {
  if (scoreHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Score History</h1>
            <p className="text-muted-foreground mb-8">
              No previous assessments found. Complete your first assessment to start tracking your progress.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const latestScore = scoreHistory[0];
  const previousScore = scoreHistory[1];
  const scoreDiff = previousScore ? latestScore.totalScore - previousScore.totalScore : 0;

  // Additional safety check for latestScore
  if (!latestScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Score History</h1>
            <p className="text-muted-foreground mb-8">
              Unable to load score history. Please try again.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for line chart
  const chartData = scoreHistory
    .filter(calc => calc && calc.totalScore !== undefined) // Filter out invalid entries
    .slice(0, 10) // Show last 10 scores
    .reverse()
    .map((calc, index) => ({
      assessment: `#${scoreHistory.length - index}`,
      score: calc.totalScore || 0,
      date: calc.createdAt ? new Date(calc.createdAt).toLocaleDateString() : 'Unknown'
    }));

  // Prepare histogram data for latest score using pillar scores with shared utilities
  const histogramData = latestScore.pillarScores && Array.isArray(latestScore.pillarScores) && latestScore.pillarScores.length > 0 ? 
    latestScore.pillarScores
      .filter(pillarScore => isValidPillarScore(pillarScore))
      .map(pillarScore => {
        const displayData = getPillarDisplayData(pillarScore, PILLAR_DEFINITIONS[pillarScore.pillar]?.name);
        return {
          factor: displayData.factor,
          score: displayData.score,
          fullMark: displayData.fullMark
        };
      }) :
    // Fallback to subScores for backward compatibility
    (latestScore.subScores && Array.isArray(latestScore.subScores) && latestScore.subScores.length > 0 ? latestScore.subScores : []).map(subScore => ({
      factor: subScore.factor?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
      score: Math.max(0, Math.min(100, subScore.score || 0)),
      fullMark: 100
    })).filter(item => item.factor && typeof item.score === 'number' && !isNaN(item.score));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Score History</h1>
              <p className="text-muted-foreground">
                Track your financial health progress over time
                {userEmail && (
                  <span className="block text-sm">
                    Logged in as: {userEmail}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {onLogout && (
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          )}
        </div>

        {/* Current Score Summary */}
        <Card className="mb-8 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {latestScore.totalScore}
                </div>
                <div className="text-sm text-muted-foreground">Current Score</div>
              </div>
              
              {previousScore && (
                <div className="text-center">
                  <div className={`flex items-center justify-center gap-2 text-2xl font-bold mb-2 ${
                    scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {scoreDiff > 0 ? <ChartLineUp className="w-6 h-6" /> : scoreDiff < 0 ? <ChartLineDown className="w-6 h-6" /> : null}
                    {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                  </div>
                  <div className="text-sm text-muted-foreground">Change from Previous</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {scoreHistory.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>
                Your financial health score progression over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="assessment" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[15, 80]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        labelFormatter={(label) => `Assessment ${label}`}
                        formatter={(value, name) => [value, 'Score']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No score history available for trend chart</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pillar Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Current Pillar Analysis</CardTitle>
              <CardDescription>
                Breakdown of your latest score by the 7 financial health pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {histogramData && histogramData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="factor" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, 'Score']}
                        labelFormatter={(label) => `Pillar: ${label}`}
                      />
                      <Bar
                        dataKey="score"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No pillar data available for histogram</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              Detailed view of all your completed assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreHistory.map((calc, index) => {
                const prevCalc = scoreHistory[index + 1];
                const diff = prevCalc ? (calc.totalScore || 0) - (prevCalc.totalScore || 0) : 0;
                
                return (
                  <div key={calc.id || `calc-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{calc.totalScore || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          {calc.createdAt ? new Date(calc.createdAt).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <Badge variant="default">Latest</Badge>
                      )}
                      
                      {diff !== 0 && (
                        <div className={`flex items-center gap-1 text-sm ${
                          diff > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {diff > 0 ? <ChartLineUp className="w-4 h-4" /> : <ChartLineDown className="w-4 h-4" />}
                          {diff > 0 ? '+' : ''}{diff}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {(calc.advice && Array.isArray(calc.advice) ? calc.advice.length : 0)} recommendations
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calc.createdAt ? new Date(calc.createdAt).toLocaleTimeString() : 'Unknown time'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
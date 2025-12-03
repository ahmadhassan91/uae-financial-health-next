import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartLineUp, ChartLineDown, WarningCircle, CheckCircle, ArrowClockwise, Eye, UserPlus, FilePdf } from '@phosphor-icons/react';
import { ScoreCalculation } from '../lib/types';
import { PILLAR_DEFINITIONS } from '../lib/survey-data';
import { PostSurveyRegistration } from './PostSurveyRegistration';
import { ReportDelivery } from './ReportDelivery';
// import { LanguageSelector } from './LanguageSelector';
import { apiClient } from '../lib/api-client';
import { useSimpleAuth } from '../hooks/use-simple-auth';
import { useLocalization } from '@/contexts/LocalizationContext';
import { calculatePillarPercentage, formatPillarScore, formatPercentage, isValidPillarScore } from '../lib/score-display-utils';

interface ScoreResultProps {
  scoreCalculation: ScoreCalculation;
  onRetake: () => void;
  onViewHistory: () => void;
}

interface SimpleUser {
  id: number;
  email: string;
  dateOfBirth: string;
  sessionId: string;
  surveyHistory: any[];
}

function getScoreColor(score: number) {
  if (score >= 65) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 35) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreLevel(score: number, t: (key: string) => string) {
  if (score >= 65) return t('excellent');
  if (score >= 50) return t('good');
  if (score >= 35) return t('fair');
  return t('needs_improvement');
}

function getScoreIcon(score: number) {
  if (score >= 65) return <CheckCircle className="w-6 h-6 text-green-600" />;
  if (score >= 50) return <ChartLineUp className="w-6 h-6 text-yellow-600" />;
  if (score >= 35) return <ChartLineUp className="w-6 h-6 text-orange-600" />;
  return <WarningCircle className="w-6 h-6 text-red-600" />;
}

export function ScoreResult({ scoreCalculation, onRetake, onViewHistory }: ScoreResultProps) {
  const { t, isRTL, formatNumber } = useLocalization();
  const { totalScore = 0, pillarScores = [], advice = [], surveyResponseId } = scoreCalculation || {};
  const [showRegistration, setShowRegistration] = useState(false);
  const [showReportDelivery, setShowReportDelivery] = useState(false);
  const { user, authenticate } = useSimpleAuth();
  
  // Check if user is a guest (not authenticated via simple auth or API)
  const isGuestUser = !user && !apiClient.isAuthenticated();
  
  if (!scoreCalculation || (!totalScore && totalScore !== 0)) {
    console.error('Invalid score calculation:', scoreCalculation);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Results</h1>
          <p className="text-muted-foreground mb-8">Unable to load your score results. Please try the assessment again.</p>
          <Button onClick={onRetake}>Retake Assessment</Button>
        </div>
      </div>
    );
  }

  // Show registration modal for guest users
  if (showRegistration && isGuestUser) {
    return (
      <PostSurveyRegistration
        guestSurveyData={scoreCalculation}
        onRegistrationComplete={(registeredUser: SimpleUser) => {
          // Close registration modal - the auth context is already updated
          setShowRegistration(false);
          
          // Optionally refresh the page to show the updated UI
          window.location.reload();
        }}
        onSkipRegistration={() => setShowRegistration(false)}
      />
    );
  }

  // Show report delivery modal
  if (showReportDelivery && surveyResponseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Generate Your Report</h1>
            <p className="text-muted-foreground">
              Download your comprehensive financial health assessment report
            </p>
          </div>
          
          <ReportDelivery
            surveyResponseId={surveyResponseId}
            userEmail={user?.email || apiClient.getCurrentUser()?.email}
            onClose={() => setShowReportDelivery(false)}
          />
        </div>
      </div>
    );
  }

  const maxScore = (pillarScores && pillarScores.length === 7) ? 80 : 75; // 80 if Q16 included, 75 otherwise
  const scorePercentage = ((totalScore - 15) / (maxScore - 15)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Financial Health Score</h1>
          <p className="text-muted-foreground">
            Based on your responses, here&apos;s your comprehensive financial wellness assessment
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-r from-card to-secondary/30">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {getScoreIcon(totalScore)}
                <div>
                  <div className={`text-6xl font-bold ${getScoreColor(totalScore)}`}>
                    {totalScore}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {getScoreLevel(totalScore, t)}
                  </Badge>
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
                <Progress value={scorePercentage} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>15</span>
                  <span>Excellent (65+)</span>
                  <span>{maxScore}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillar Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Pillar Scores</CardTitle>
              <CardDescription>
                Your performance across key areas of financial health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pillarScores && pillarScores.length > 0 ? pillarScores
                .filter(pillarScore => isValidPillarScore(pillarScore))
                .map((pillarScore) => {
                  const pillarDef = PILLAR_DEFINITIONS[pillarScore.pillar];
                  const pillarPercentage = calculatePillarPercentage(pillarScore);
                  
                  return (
                    <div key={pillarScore.pillar} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {pillarDef?.name || pillarScore.pillar}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {formatPillarScore(pillarScore)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatPercentage(pillarPercentage)}
                          </span>
                        </div>
                      </div>
                      <Progress value={pillarPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {pillarDef?.description || 'Financial health assessment'}
                      </p>
                    </div>
                  );
                }) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Detailed pillar breakdown will be available after completing the assessment.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Educational guidance to improve your financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <WarningCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This is educational content only and does not constitute financial advice. 
                  Consult qualified professionals for personalized guidance.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                {advice && advice.length > 0 ? advice.map((tip, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{tip}</p>
                  </div>
                )) : (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Personalized recommendations will be generated based on your assessment results.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Interpretation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Understanding Your Score</CardTitle>
            <CardDescription>
              Financial Health Score ranges from 15 to {maxScore} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="text-2xl font-bold text-red-600 mb-1">15-34</div>
                <div className="text-sm font-medium text-red-700">Needs Improvement</div>
                <div className="text-xs text-red-600 mt-1">Focus on building basic financial habits</div>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1">35-49</div>
                <div className="text-sm font-medium text-orange-700">Fair</div>
                <div className="text-xs text-orange-600 mt-1">Good foundation, room for growth</div>
              </div>
              
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600 mb-1">50-64</div>
                <div className="text-sm font-medium text-yellow-700">Good</div>
                <div className="text-xs text-yellow-600 mt-1">Strong financial health</div>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">65-{maxScore}</div>
                <div className="text-sm font-medium text-green-700">Excellent</div>
                <div className="text-xs text-green-600 mt-1">Outstanding financial wellness</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Prompt for Guest Users */}
        {isGuestUser && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Save Your Results</h3>
                    <p className="text-muted-foreground">
                      Create an account to track your progress, download reports, and access your assessment history.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowRegistration(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Report Generation Button - Show for authenticated users or if surveyResponseId is available */}
          {(surveyResponseId && (!isGuestUser || user)) && (
            <Button 
              onClick={() => setShowReportDelivery(true)} 
              variant="default" 
              className="flex items-center gap-2"
            >
              <FilePdf className="w-4 h-4" />
              Generate Report
            </Button>
          )}
          
          <Button onClick={onViewHistory} variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Score History
          </Button>
          <Button onClick={onRetake} variant="outline" className="flex items-center gap-2">
            <ArrowClockwise className="w-4 h-4" />
            Retake Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
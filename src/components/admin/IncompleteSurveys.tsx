'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Clock,
  Mail,
  Phone,
  User,
  AlertTriangle,
  Send,
  RefreshCw,
  TrendingDown,
  Users,
  MessageSquare,
  Info,
  Download
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface IncompleteSurvey {
  id: number;
  session_id: string;
  user_id?: number;
  current_step: number;
  total_steps: number;
  responses?: Record<string, any>;
  started_at: string;
  last_activity: string;
  abandoned_at?: string;
  email?: string;
  phone_number?: string;
  is_abandoned: boolean;
  follow_up_sent: boolean;
  follow_up_count: number;
  company_id?: number;
  company_url?: string;
}

interface IncompleteSurveyStats {
  total_incomplete: number;
  abandoned_count: number;
  average_completion_rate: number;
  most_common_exit_step: number;
  follow_up_pending: number;
}

export function IncompleteSurveys() {
  const [surveys, setSurveys] = useState<IncompleteSurvey[]>([]);
  const [stats, setStats] = useState<IncompleteSurveyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurveys, setSelectedSurveys] = useState<number[]>([]);
  const [followUpMessage, setFollowUpMessage] = useState(
    "Hi {customer_name},\n\nYou've already started your journey toward financial clarity.\n\nThe good news? You're just a few steps away from gaining complete financial clarity.\n\nTake this quick test to see exactly where you stand financially and learn about it in the most simple and practical way.\n\nDon't stop halfway. The clarity you're looking for is just moments away.\n\nComplete your financial check-up now: {resume_link}"
  );
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to get survey status
  const getSurveyStatus = (survey: IncompleteSurvey) => {
    const now = new Date();
    const lastActivity = new Date(survey.last_activity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity < 24) {
      return { label: 'Active', variant: 'default' as const, color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (hoursSinceActivity < 72) {
      return { label: 'Stalled', variant: 'secondary' as const, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { label: 'Abandoned', variant: 'destructive' as const, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [surveysData, statsData] = await Promise.all([
        apiClient.getIncompleteSurveys(0, 100, activeTab === 'abandoned'),
        apiClient.getIncompleteSurveyStats()
      ]);

      setSurveys(surveysData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSurvey = (surveyId: number, checked: boolean) => {
    if (checked) {
      setSelectedSurveys(prev => [...prev, surveyId]);
    } else {
      setSelectedSurveys(prev => prev.filter(id => id !== surveyId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleSurveys = surveys
        .filter(s => s.email && !s.follow_up_sent)
        .map(s => s.id);
      setSelectedSurveys(eligibleSurveys);
    } else {
      setSelectedSurveys([]);
    }
  };

  const handleSendFollowUp = async () => {
    if (selectedSurveys.length === 0) return;

    try {
      setSendingFollowUp(true);

      const result = await apiClient.sendFollowUp({
        survey_ids: selectedSurveys,
        message_template: followUpMessage,
        send_email: true,
        send_sms: false
      });

      // Refresh data
      await loadData();
      setSelectedSurveys([]);

      toast.success(`Follow-up sent to ${result.sent_count} users`, {
        description: `Successfully sent reminder emails to ${result.sent_count} incomplete survey participants`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send follow-up');
    } finally {
      setSendingFollowUp(false);
    }
  };

  const getCompletionPercentage = (survey: IncompleteSurvey) => {
    return Math.round((survey.current_step / survey.total_steps) * 100);
  };

  const getTimeSinceActivity = (lastActivity: string) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await apiClient.exportIncompleteSurveys(activeTab === 'abandoned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const eligibleForFollowUp = surveys.filter(s => s.email && !s.follow_up_sent);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Incomplete</p>
                  <p className="text-2xl font-bold">{stats.total_incomplete}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Abandoned</p>
                  <p className="text-2xl font-bold">{stats.abandoned_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Avg Completion</p>
                  <p className="text-2xl font-bold">{stats.average_completion_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Common Exit Step</p>
                  <p className="text-2xl font-bold">{stats.most_common_exit_step}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Follow-up Pending</p>
                  <p className="text-2xl font-bold">{stats.follow_up_pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Legend */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span>🟢</span> <strong>Active:</strong> Less than 24 hours since last activity
            </span>
            <span className="flex items-center gap-1">
              <span>🟡</span> <strong>Stalled:</strong> 1-3 days since last activity
            </span>
            <span className="flex items-center gap-1">
              <span>🔴</span> <strong>Abandoned:</strong> 3+ days since last activity - requires follow-up
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <div>
            <TabsList>
              <TabsTrigger value="all">
                <span className="flex items-center gap-2">
                  All Surveys
                  {stats && <Badge variant="secondary" className="ml-1">{stats.total_incomplete}</Badge>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="abandoned">
                <span className="flex items-center gap-2">
                  Recovery Needed
                  {stats && <Badge variant="destructive" className="ml-1">{stats.abandoned_count}</Badge>}
                </span>
              </TabsTrigger>
            </TabsList>
            <p className="text-xs text-muted-foreground mt-2">
              {activeTab === 'all'
                ? 'View all incomplete surveys including recent attempts'
                : 'Abandoned surveys requiring follow-up (inactive for 24+ hours)'}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleExportCSV} disabled={isExporting || surveys.length === 0} variant="outline" size="sm">
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#5E5E5E]" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
            <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 text-[#5E5E5E] ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <SurveyList
            surveys={surveys}
            selectedSurveys={selectedSurveys}
            onSelectSurvey={handleSelectSurvey}
            onSelectAll={handleSelectAll}
            eligibleCount={eligibleForFollowUp.length}
            isAbandonedView={false}
          />
        </TabsContent>

        <TabsContent value="abandoned" className="space-y-4">
          <SurveyList
            surveys={surveys}
            selectedSurveys={selectedSurveys}
            onSelectSurvey={handleSelectSurvey}
            onSelectAll={handleSelectAll}
            eligibleCount={eligibleForFollowUp.length}
            isAbandonedView={true}
          />
        </TabsContent>
      </Tabs>

      {/* Follow-up Section */}
      {eligibleForFollowUp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Follow-up Messages
            </CardTitle>
            <CardDescription>
              Send reminder emails to users who haven't completed their surveys.
              <span className="text-orange-600 font-medium"> Note: Email delivery requires configuration.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message Template</label>
              <Textarea
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedSurveys.length} of {eligibleForFollowUp.length} surveys selected
              </p>

              <Button
                onClick={handleSendFollowUp}
                disabled={selectedSurveys.length === 0 || sendingFollowUp}
              >
                {sendingFollowUp && <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#5E5E5E]" />}
                <Send className="h-4 w-4 mr-2" />
                Send Follow-up ({selectedSurveys.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SurveyListProps {
  surveys: IncompleteSurvey[];
  selectedSurveys: number[];
  onSelectSurvey: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  eligibleCount: number;
  isAbandonedView?: boolean;
}

function SurveyList({ surveys, selectedSurveys, onSelectSurvey, onSelectAll, eligibleCount, isAbandonedView = false }: SurveyListProps) {
  const getCompletionPercentage = (survey: IncompleteSurvey) => {
    // Calculate based on actual responses answered, not just current step
    const responsesCount = survey.responses ? Object.keys(survey.responses).length : 0;
    // Assume total questions based on the survey type - Financial Clinic has 15 questions
    const totalQuestions = 15; // This could be made dynamic based on survey type

    // If no responses, fall back to step-based calculation for very early stages
    if (responsesCount === 0) {
      return Math.round((survey.current_step / survey.total_steps) * 100);
    }

    return Math.round((responsesCount / totalQuestions) * 100);
  };

  const getTimeSinceActivity = (lastActivity: string) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getStatusBadge = (lastActivity: string) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return {
        label: 'Active',
        icon: '🟢',
        variant: 'default' as const,
        className: 'bg-green-500 hover:bg-green-600',
        description: 'Less than 24 hours since last activity'
      };
    } else if (diffHours < 72) {
      return {
        label: 'Stalled',
        icon: '🟡',
        variant: 'secondary' as const,
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        description: '1-3 days since last activity'
      };
    } else {
      return {
        label: 'Abandoned',
        icon: '🔴',
        variant: 'destructive' as const,
        className: '',
        description: 'More than 3 days since last activity'
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Incomplete Surveys</CardTitle>
            <CardDescription>
              {surveys.length} incomplete surveys found
            </CardDescription>
          </div>

          {eligibleCount > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedSurveys.length === eligibleCount}
                onCheckedChange={onSelectAll}
                className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
              />
              <label className="text-sm font-medium cursor-pointer" onClick={() => onSelectAll(selectedSurveys.length !== eligibleCount)}>
                Select all eligible ({eligibleCount})
              </label>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {surveys.map((survey) => {
            const statusInfo = getStatusBadge(survey.last_activity);
            return (
              <div
                key={survey.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${statusInfo.label === 'Abandoned' ? 'border-red-200 bg-red-50/30' :
                    statusInfo.label === 'Stalled' ? 'border-yellow-200 bg-yellow-50/30' :
                      'border-green-200 bg-green-50/30'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {survey.email && !survey.follow_up_sent && (
                      <div className="flex items-center justify-center min-w-[24px] min-h-[24px] p-1">
                        <Checkbox
                          checked={selectedSurveys.includes(survey.id)}
                          onCheckedChange={(checked) => onSelectSurvey(survey.id, !!checked)}
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        {survey.user_id ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium">
                          {survey.user_id ? 'Registered User' : 'Guest User'}
                        </span>

                        {/* Company Badge */}
                        {survey.company_url && (
                          <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
                            <span className="mr-1">🏢</span>
                            {survey.company_url}
                          </Badge>
                        )}

                        {/* Status Badge */}
                        <Badge
                          variant={statusInfo.variant}
                          className={statusInfo.className}
                          title={statusInfo.description}
                        >
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </Badge>

                        {survey.follow_up_sent && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500">
                            Follow-up Sent ({survey.follow_up_count})
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${getCompletionPercentage(survey)}%` }}
                              />
                            </div>
                            <span className="font-medium">
                              {getCompletionPercentage(survey)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Step {survey.current_step} of {survey.total_steps}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Contact</p>
                          {survey.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{survey.email}</span>
                            </div>
                          )}
                          {survey.phone_number && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{survey.phone_number}</span>
                            </div>
                          )}
                          {!survey.email && !survey.phone_number && (
                            <span className="text-xs text-muted-foreground">No contact info</span>
                          )}
                        </div>

                        <div>
                          <p className="text-muted-foreground">Last Activity</p>
                          <p className="text-xs">{getTimeSinceActivity(survey.last_activity)}</p>
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(survey.started_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {surveys.length === 0 && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                {isAbandonedView ? (
                  <MessageSquare className="h-12 w-12 text-green-500 opacity-50" />
                ) : (
                  <Clock className="h-12 w-12 text-muted-foreground opacity-50" />
                )}
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {isAbandonedView
                  ? '🎉 Great News! No Abandoned Surveys'
                  : 'No Incomplete Surveys Found'}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {isAbandonedView
                  ? 'All incomplete surveys are still active or have been completed. No recovery action needed at this time.'
                  : 'All users are actively completing their financial health assessments. Check back later to monitor progress.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
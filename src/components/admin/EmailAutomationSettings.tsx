'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Mail, Clock, Calendar, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function EmailAutomationSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [config, setConfig] = useState({
        incomplete_enabled: false,
        incomplete_days: 2,
        checkup_enabled: false,
        checkup_days: 180
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getEmailConfig();
            setConfig({
                incomplete_enabled: data.incomplete_enabled,
                incomplete_days: data.incomplete_days,
                checkup_enabled: data.checkup_enabled,
                checkup_days: data.checkup_days
            });
            setError(null);
        } catch (err) {
            console.error('Failed to load email config:', err);
            setError('Failed to load configuration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await apiClient.updateEmailConfig(config);
            toast.success('Settings saved successfully');
            setError(null);
        } catch (err) {
            console.error('Failed to save email config:', err);
            setError('Failed to save changes. Please try again.');
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Email Automation</h2>
                    <p className="text-muted-foreground">
                        Configure automated email reminders for surveys and checkups.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Incomplete Survey Reminders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <CardTitle>Incomplete Survey Reminders</CardTitle>
                        </div>
                        <CardDescription>
                            Automatically remind users who abandoned their survey to complete it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="incomplete-enabled" className="flex flex-col space-y-1">
                                <span>Enable Reminders</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Send emails to users with abandoned sessions
                                </span>
                            </Label>
                            <Switch
                                id="incomplete-enabled"
                                checked={config.incomplete_enabled}
                                onCheckedChange={(checked) => setConfig({ ...config, incomplete_enabled: checked })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="incomplete-days">Delay (Days)</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="incomplete-days"
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={config.incomplete_days}
                                    onChange={(e) => setConfig({ ...config, incomplete_days: parseInt(e.target.value) || 1 })}
                                    className="w-24"
                                    disabled={!config.incomplete_enabled}
                                />
                                <span className="text-sm text-muted-foreground">days after last activity</span>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                We recommend waiting at least 24 hours (1 day) before sending a reminder.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 6-Month Checkup Reminders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <CardTitle>Periodic Checkup Reminders</CardTitle>
                        </div>
                        <CardDescription>
                            Encourage users to retake the assessment to track their progress.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="checkup-enabled" className="flex flex-col space-y-1">
                                <span>Enable Checkups</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Send emails to users after a set period
                                </span>
                            </Label>
                            <Switch
                                id="checkup-enabled"
                                checked={config.checkup_enabled}
                                onCheckedChange={(checked) => setConfig({ ...config, checkup_enabled: checked })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="checkup-days">Frequency (Days)</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="checkup-days"
                                    type="number"
                                    min="30"
                                    max="365"
                                    step="30"
                                    value={config.checkup_days}
                                    onChange={(e) => setConfig({ ...config, checkup_days: parseInt(e.target.value) || 180 })}
                                    className="w-24"
                                    disabled={!config.checkup_enabled}
                                />
                                <span className="text-sm text-muted-foreground">days after completion</span>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Standard practice is 180 days (6 months) for financial health reviews.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">How it works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                            <strong>1. Scheduler:</strong> The system checks for eligible users every hour.
                        </p>
                        <p>
                            <strong>2. Incomplete Surveys:</strong> Users who started a survey but haven't touched it for the specified number of days will receive a "Resume Your Assessment" email with a direct link.
                        </p>
                        <p>
                            <strong>3. Checkups:</strong> Users who completed a survey more than X days ago (and haven't taken one since) will receive a "Time for a Checkup" email.
                        </p>
                        <p>
                            <strong>Note:</strong> Emails are only sent if the user has provided an email address.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

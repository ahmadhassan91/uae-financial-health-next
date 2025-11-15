'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, LineChart, Line, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  UserPlus, Users, TrendingUp, Calendar, 
  Mail, CheckCircle, Clock, Funnel 
} from 'lucide-react';

interface RegistrationMetric {
  date: string;
  registrations: number;
  guestConversions: number;
  totalUsers: number;
}

interface RegistrationMetricsProps {
  className?: string;
}

export function RegistrationMetrics({ className }: RegistrationMetricsProps) {
  const [metrics, setMetrics] = useState<RegistrationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - in real implementation, this would come from API
  useEffect(() => {
    const generateMockData = () => {
      const data: RegistrationMetric[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          registrations: Math.floor(Math.random() * 10) + 2,
          guestConversions: Math.floor(Math.random() * 5) + 1,
          totalUsers: 150 + (29 - i) * 3
        });
      }
      
      setMetrics(data);
      setLoading(false);
    };

    // Simulate API call delay
    setTimeout(generateMockData, 1000);
  }, []);

  const totalRegistrations = metrics.reduce((sum, m) => sum + m.registrations, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.guestConversions, 0);
  const conversionRate = totalRegistrations > 0 ? (totalConversions / totalRegistrations * 100) : 0;
  const currentUsers = metrics.length > 0 ? metrics[metrics.length - 1].totalUsers : 0;

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registration Analytics
            </CardTitle>
            <CardDescription>Loading registration metrics...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registration Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{currentUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Registrations (30d)</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Guest Conversions (30d)</p>
                  <p className="text-2xl font-bold">{totalConversions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registration Trends (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily registration and guest conversion metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      value,
                      name === 'registrations' ? 'New Registrations' : 
                      name === 'guestConversions' ? 'Guest Conversions' : name
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="registrations"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="guestConversions" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="guestConversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Registration Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Funnel className="h-5 w-5" />
              Registration Sources
            </CardTitle>
            <CardDescription>
              How users are discovering and registering for the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Post-Survey Registration</p>
                    <p className="text-sm text-muted-foreground">Users who register after completing assessment</p>
                  </div>
                </div>
                <Badge variant="secondary">{totalConversions} users</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Direct Registration</p>
                    <p className="text-sm text-muted-foreground">Users who register before taking assessment</p>
                  </div>
                </div>
                <Badge variant="secondary">{totalRegistrations - totalConversions} users</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Company Invitations</p>
                    <p className="text-sm text-muted-foreground">Users invited through company programs</p>
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
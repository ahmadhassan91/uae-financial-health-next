import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings, Languages, Users, BarChart3,
  FileText, Globe, Code, Target, Package, Shield, Mail
} from 'lucide-react';

import { QuestionVariationManager } from './QuestionVariationManager';
import { VariationSetManager } from './VariationSetManager';
import { DemographicRuleManager } from './DemographicRuleManager';
import { LocalizationManager } from './LocalizationManager';
import { CRMManagement } from './CRMManagement';
import { EmailAutomationSettings } from './EmailAutomationSettings';

export function SystemManagement() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Management</h1>
          <p className="text-muted-foreground">
            Advanced survey features administration and configuration
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Variations</TabsTrigger>
          <TabsTrigger value="sets">Variation Sets</TabsTrigger>
          <TabsTrigger value="email">Email Automation</TabsTrigger>
          <TabsTrigger value="crm">CRM Integration</TabsTrigger>
          {/* <TabsTrigger value="rules">Demographic Rules</TabsTrigger> */}
          {/* <TabsTrigger value="localization">Localization</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Question Variations Overview */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTab('questions')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Question Variations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Active variations across 8 base questions
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">85% usage rate</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Variation Sets Overview */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTab('sets')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Variation Sets</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Complete sets of 15 question variations
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">3 templates</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Email Automation Overview */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTab('email')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Automation</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Config</div>
                <p className="text-xs text-muted-foreground">
                  Manage automated reminders
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">2 types</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Demographic Rules Overview - HIDDEN */}
            {/* <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTab('rules')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demographic Rules</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  Active rules for question customization
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">92% effectiveness</Badge>
                </div>
              </CardContent>
            </Card> */}

            {/* CRM Integration Overview */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
              onClick={() => setSelectedTab('crm')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CRM Integration</CardTitle>
                <Shield className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Microsoft Dynamics CRM Sync
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Secure</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Localization Overview - HIDDEN */}
            {/* <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTab('localization')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Localization</CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Languages supported (EN, AR)
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">78% coverage</Badge>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <QuestionVariationManager />
        </TabsContent>

        <TabsContent value="sets">
          <VariationSetManager />
        </TabsContent>

        <TabsContent value="email">
          <EmailAutomationSettings />
        </TabsContent>

        <TabsContent value="crm">
          <CRMManagement />
        </TabsContent>

      {/* HIDDEN: Demographic Rules - Not needed at this time */}
      {/* <TabsContent value="rules">
          <DemographicRuleManager />
        </TabsContent> */}

      {/* HIDDEN: Localization - Not needed at this time */}
      {/* <TabsContent value="localization">
          <LocalizationManager />
        </TabsContent> */}
    </Tabs>
    </div >
  );
}
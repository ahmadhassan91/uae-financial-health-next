import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Languages, Users, BarChart3, 
  FileText, Globe, Code, Target, Package
} from 'lucide-react';

import { QuestionVariationManager } from './QuestionVariationManager';
import { VariationSetManager } from './VariationSetManager';
import { DemographicRuleManager } from './DemographicRuleManager';
import { LocalizationManager } from './LocalizationManager';

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Variations</TabsTrigger>
          <TabsTrigger value="sets">Variation Sets</TabsTrigger>
          {/* <TabsTrigger value="rules">Demographic Rules</TabsTrigger> */
          {/* <TabsTrigger value="localization">Localization</TabsTrigger> */
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Question Variations Overview */
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

            {/* Variation Sets Overview */
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

            {/* Demographic Rules Overview - HIDDEN */
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
            </Card> */

            {/* Localization Overview - HIDDEN */
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
            </Card> */

            {/* HIDDEN: System Health - Static data, not needed at this time */
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="default">99.9% uptime</Badge>
                </div>
              </CardContent>
            </Card> */

            {/* HIDDEN: Performance Metrics - Static data, not needed at this time */
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156ms</div>
                <p className="text-xs text-muted-foreground">
                  Average question loading time
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">95% cache hit</Badge>
                </div>
              </CardContent>
            </Card> */

            {/* HIDDEN: User Engagement - Static data, not needed at this time */
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  Surveys with advanced features
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">+23% this month</Badge>
                </div>
              </CardContent>
            </Card> */
          </div>

          {/* Feature Status Cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Advanced Features Status
                </CardTitle>
                <CardDescription>
                  Current status of advanced survey features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Post-Survey Registration</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Email & PDF Reports</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Arabic Localization</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Dynamic Questions</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">URL Customization</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest system management activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Question variation created</p>
                      <p className="text-xs text-muted-foreground">
                        UAE Citizen version for Q1 - 2 hours ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Arabic translation completed</p>
                      <p className="text-xs text-muted-foreground">
                        5 recommendation texts - 4 hours ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Demographic rule updated</p>
                      <p className="text-xs text-muted-foreground">
                        Expat targeting rule priority changed - 6 hours ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System optimization</p>
                      <p className="text-xs text-muted-foreground">
                        Cache performance improved - 8 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */
        </TabsContent>

        <TabsContent value="questions">
          <QuestionVariationManager />
        </TabsContent>

        <TabsContent value="sets">
          <VariationSetManager />
        </TabsContent>

        {/* HIDDEN: Demographic Rules - Not needed at this time */
        {/* <TabsContent value="rules">
          <DemographicRuleManager />
        </TabsContent> */

        {/* HIDDEN: Localization - Not needed at this time */
        {/* <TabsContent value="localization">
          <LocalizationManager />
        </TabsContent> */
      </Tabs>
    </div>
  );
}
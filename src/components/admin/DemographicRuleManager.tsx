import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Edit, Trash2, TestTube, BarChart3, 
  Settings, AlertTriangle, CheckCircle, Play,
  Code, Users, Target, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApiCall } from '@/hooks/use-admin-auth';

interface DemographicRule {
  id: number;
  name: string;
  description?: string;
  conditions: any;
  actions: any;
  priority: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at?: string;
}

interface RuleValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface RuleAnalytics {
  total_rules: number;
  active_rules: number;
  average_priority: number;
  rule_effectiveness: Array<{
    rule_id: number;
    rule_name: string;
    match_rate: number;
    impact_score: number;
  }>;
  most_used_conditions: Array<{
    field: string;
    operator: string;
    usage_count: number;
  }>;
  analysis_period_days: number;
}

const DEMOGRAPHIC_FIELDS = [
  { value: 'age', label: 'Age' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'emirate', label: 'Emirate' },
  { value: 'employment_status', label: 'Employment Status' },
  { value: 'monthly_income', label: 'Monthly Income' },
  { value: 'education_level', label: 'Education Level' },
  { value: 'years_in_uae', label: 'Years in UAE' },
  { value: 'family_status', label: 'Family Status' },
  { value: 'housing_status', label: 'Housing Status' },
  { value: 'islamic_finance_preference', label: 'Islamic Finance Preference' }
];

const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'in', label: 'In List' },
  { value: 'not_in', label: 'Not In List' },
  { value: 'contains', label: 'Contains' }
];

const ACTION_TYPES = [
  { value: 'include_questions', label: 'Include Questions' },
  { value: 'exclude_questions', label: 'Exclude Questions' },
  { value: 'add_questions', label: 'Add Questions' }
];

export function DemographicRuleManager() {
  const [rules, setRules] = useState<DemographicRule[]>([]);
  const [analytics, setAnalytics] = useState<RuleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('list');
  
  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<DemographicRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: { and: [] },
    actions: {},
    priority: 100,
    is_active: true
  });
  
  // Rule builder state
  const [conditionBuilder, setConditionBuilder] = useState({
    field: '',
    operator: '',
    value: '',
    logicalOperator: 'and'
  });
  
  const [actionBuilder, setActionBuilder] = useState({
    type: '',
    questions: []
  });
  
  // Validation state
  const [validation, setValidation] = useState<RuleValidation | null>(null);
  const [testingRule, setTestingRule] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load rules
      const rulesResponse = await adminApiCall('/api/admin/demographic-rules');
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData.rules || []);
      }
      
      // Load analytics
      const analyticsResponse = await adminApiCall('/api/admin/demographic-rules/analytics/overview');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load demographic rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await adminApiCall('/api/admin/demographic-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Demographic rule created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create rule');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    }
  };

  const handleUpdateRule = async (id: number) => {
    try {
      const response = await adminApiCall(`/api/admin/demographic-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Demographic rule updated successfully');
        setEditingRule(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update rule');
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      const response = await adminApiCall(`/api/admin/demographic-rules/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Demographic rule deleted successfully');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleTestRule = async () => {
    try {
      setTestingRule(true);
      
      const testRequest = {
        conditions: formData.conditions,
        actions: formData.actions,
        test_profiles: [] // Would include sample profiles for testing
      };
      
      const response = await adminApiCall('/api/admin/demographic-rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest)
      });
      
      if (response.ok) {
        const result = await response.json();
        setValidation(result.validation);
        
        if (result.validation.valid) {
          toast.success('Rule validation passed');
        } else {
          toast.warning('Rule has validation issues');
        }
      } else {
        toast.error('Failed to test rule');
      }
    } catch (error) {
      console.error('Error testing rule:', error);
      toast.error('Failed to test rule');
    } finally {
      setTestingRule(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      conditions: { and: [] },
      actions: {},
      priority: 100,
      is_active: true
    });
    setConditionBuilder({
      field: '',
      operator: '',
      value: '',
      logicalOperator: 'and'
    });
    setActionBuilder({
      type: '',
      questions: []
    });
    setValidation(null);
  };

  const addCondition = () => {
    if (!conditionBuilder.field || !conditionBuilder.operator || !conditionBuilder.value) {
      toast.error('Please fill all condition fields');
      return;
    }
    
    const condition = {
      [conditionBuilder.field]: {
        [conditionBuilder.operator]: conditionBuilder.value
      }
    };
    
    const newConditions = { ...formData.conditions };
    if (!newConditions[conditionBuilder.logicalOperator]) {
      newConditions[conditionBuilder.logicalOperator] = [];
    }
    newConditions[conditionBuilder.logicalOperator].push(condition);
    
    setFormData({ ...formData, conditions: newConditions });
    setConditionBuilder({ ...conditionBuilder, field: '', operator: '', value: '' });
  };

  const addAction = () => {
    if (!actionBuilder.type || actionBuilder.questions.length === 0) {
      toast.error('Please select action type and questions');
      return;
    }
    
    const newActions = { ...formData.actions };
    newActions[actionBuilder.type] = actionBuilder.questions;
    
    setFormData({ ...formData, actions: newActions });
    setActionBuilder({ type: '', questions: [] });
  };

  const startEdit = (rule: DemographicRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      conditions: rule.conditions,
      actions: rule.actions,
      priority: rule.priority,
      is_active: rule.is_active
    });
  };

  const renderConditions = (conditions: any, level = 0) => {
    if (!conditions || typeof conditions !== 'object') return null;
    
    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
        {Object.entries(conditions).map(([key, value], index) => {
          if (key === 'and' || key === 'or') {
            return (
              <div key={index}>
                <Badge variant="outline" className="mb-2">
                  {key.toUpperCase()}
                </Badge>
                {Array.isArray(value) && value.map((condition, condIndex) => (
                  <div key={condIndex}>
                    {renderConditions(condition, level + 1)}
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{key}</Badge>
                <span>{JSON.stringify(value)}</span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E5E5E] mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading demographic rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Demographic Rule Management</h2>
          <p className="text-muted-foreground">
            Create and manage rules for dynamic question selection based on user demographics
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Demographic Rule</DialogTitle>
              <DialogDescription>
                Create a new rule to customize question selection based on user demographics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., UAE Citizens Rule"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      max="1000"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers = higher priority</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe when this rule should be applied"
                    rows={2}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Condition Builder */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conditions</h3>
                
                <div className="grid grid-cols-5 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Logical Operator</Label>
                    <Select 
                      value={conditionBuilder.logicalOperator} 
                      onValueChange={(value) => setConditionBuilder({ ...conditionBuilder, logicalOperator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Select 
                      value={conditionBuilder.field} 
                      onValueChange={(value) => setConditionBuilder({ ...conditionBuilder, field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEMOGRAPHIC_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select 
                      value={conditionBuilder.operator} 
                      onValueChange={(value) => setConditionBuilder({ ...conditionBuilder, operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={conditionBuilder.value}
                      onChange={(e) => setConditionBuilder({ ...conditionBuilder, value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                  
                  <Button onClick={addCondition} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Current Conditions */}
                {Object.keys(formData.conditions).length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Conditions</Label>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {renderConditions(formData.conditions)}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Action Builder */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Actions</h3>
                
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Action Type</Label>
                    <Select 
                      value={actionBuilder.type} 
                      onValueChange={(value) => setActionBuilder({ ...actionBuilder, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Question IDs</Label>
                    <Input
                      value={actionBuilder.questions.join(', ')}
                      onChange={(e) => setActionBuilder({ 
                        ...actionBuilder, 
                        questions: e.target.value.split(',').map(q => q.trim()).filter(q => q)
                      })}
                      placeholder="q1, q2, q3..."
                    />
                  </div>
                  
                  <Button onClick={addAction} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Current Actions */}
                {Object.keys(formData.actions).length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Actions</Label>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {Object.entries(formData.actions).map(([actionType, questions]) => (
                        <div key={actionType} className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{actionType}</Badge>
                          <span>{Array.isArray(questions) ? questions.join(', ') : JSON.stringify(questions)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Validation Results */}
              {validation && (
                <Alert className={validation.valid ? "border-green-200" : "border-red-200"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {validation.valid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          Rule {validation.valid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      
                      {validation.errors.length > 0 && (
                        <div>
                          <p className="font-medium text-red-600">Errors:</p>
                          <ul className="list-disc list-inside text-sm">
                            {validation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.warnings.length > 0 && (
                        <div>
                          <p className="font-medium text-yellow-600">Warnings:</p>
                          <ul className="list-disc list-inside text-sm">
                            {validation.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestRule}
                  disabled={!formData.name || testingRule}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testingRule ? 'Testing...' : 'Test Rule'}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRule}
                    disabled={!validation?.valid}
                  >
                    Create Rule
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="list">Rules List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demographic Rules</CardTitle>
              <CardDescription>
                {rules.length} rules configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No demographic rules found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              {rule.description && (
                                <div className="text-sm text-muted-foreground">
                                  {rule.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {rule.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {Object.keys(rule.conditions).length} conditions
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {Object.keys(rule.actions).length} actions
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {rule.usage_count} uses
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(rule)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_rules}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.active_rules} active
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.average_priority.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rule priority score
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Analysis Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.analysis_period_days}</div>
                    <p className="text-xs text-muted-foreground">
                      Days analyzed
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Rule Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle>Rule Effectiveness</CardTitle>
                  <CardDescription>
                    Performance metrics for demographic rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.rule_effectiveness.map((rule, index) => (
                      <div key={rule.rule_id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{rule.rule_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Match Rate: {(rule.match_rate * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Impact: {rule.impact_score.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Most Used Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Conditions</CardTitle>
                  <CardDescription>
                    Popular demographic conditions in rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.most_used_conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{condition.field}</Badge>
                          <span className="text-sm">{condition.operator}</span>
                        </div>
                        <Badge variant="secondary">
                          {condition.usage_count} uses
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Eye, 
  RotateCcw, 
  Settings,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Play,
  Copy,
  History,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Question {
  id: string;
  text: string;
  options: Array<{ value: number; label: string }>;
  factor: string;
  weight: number;
  question_number: number;
  type: string;
  required: boolean;
  variation_used?: string;
}

interface QuestionSet {
  id: number;
  name: string;
  description?: string;
  base_questions: string[];
  custom_questions?: Question[];
  excluded_questions?: string[];
  question_variations?: Record<string, string>;
  demographic_rules?: any[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  total_questions?: number;
}

interface QuestionVariation {
  id: number;
  base_question_id: string;
  variation_name: string;
  language: string;
  text: string;
  options: Array<{ value: number; label: string }>;
  factor: string;
  weight: number;
  is_active: boolean;
}

interface PreviewData {
  questions: Question[];
  question_set_id: string;
  company_config?: any;
  metadata: {
    total_questions: number;
    language: string;
    demographic_rules_applied: string[];
    base_questions_count?: number;
    custom_questions_count?: number;
    excluded_questions_count?: number;
  };
}

interface TestResult {
  question_id: string;
  response_time: number;
  difficulty_rating: number;
  clarity_rating: number;
  relevance_rating: number;
  comments?: string;
}

interface CompanyQuestionManagerProps {
  companyId: number;
  companyName: string;
}

export default function CompanyQuestionManager({ companyId, companyName }: CompanyQuestionManagerProps) {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuestionSet | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [availableVariations, setAvailableVariations] = useState<QuestionVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFactor, setFilterFactor] = useState<string>('all');
  const [isTestMode, setIsTestMode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [questionSetVersions, setQuestionSetVersions] = useState<QuestionSet[]>([]);

  // Form state for creating/editing question sets
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_questions: [] as string[],
    custom_questions: [] as Question[],
    excluded_questions: [] as string[],
    question_variations: {} as Record<string, string>
  });

  useEffect(() => {
    loadQuestionSets();
    loadAllQuestions();
    loadAvailableVariations();
  }, [companyId]);

  const loadQuestionSets = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/question-sets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestionSets(data);
        
        // Set active question set
        const active = data.find((qs: QuestionSet) => qs.is_active);
        if (active) {
          setActiveQuestionSet(active);
          setFormData({
            name: active.name,
            description: active.description || '',
            base_questions: active.base_questions,
            custom_questions: active.custom_questions || [],
            excluded_questions: active.excluded_questions || [],
            question_variations: active.question_variations || {}
          });
        }
      }
    } catch (error) {
      console.error('Error loading question sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllQuestions = async () => {
    try {
      const response = await fetch('/api/surveys/questions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadAvailableVariations = async () => {
    try {
      const response = await fetch(`/api/companies/question-variations?company_id=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableVariations(data);
      }
    } catch (error) {
      console.error('Error loading variations:', error);
    }
  };

  const handleSaveQuestionSet = async () => {
    setValidationErrors([]);
    setIsSaving(true);
    
    // Enhanced validation
    const errors = [];
    if (!formData.name.trim()) {
      errors.push('Question set name is required');
    }
    if (formData.name.length > 200) {
      errors.push('Question set name must be less than 200 characters');
    }
    if (formData.base_questions.length === 0) {
      errors.push('At least one base question must be selected');
    }
    if (formData.base_questions.length > 50) {
      errors.push('Maximum 50 questions allowed per set');
    }
    
    // Validate question variations
    for (const [questionId, variationName] of Object.entries(formData.question_variations)) {
      if (!formData.base_questions.includes(questionId)) {
        errors.push(`Variation set for question ${questionId} but question not selected`);
      }
      const variation = availableVariations.find(
        v => v.base_question_id === questionId && v.variation_name === variationName
      );
      if (!variation) {
        errors.push(`Invalid variation ${variationName} for question ${questionId}`);
      }
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSaving(false);
      return;
    }

    try {
      const url = activeQuestionSet 
        ? `/api/companies/${companyId}/question-sets/${activeQuestionSet.id}`
        : `/api/companies/${companyId}/question-sets`;
      
      const method = activeQuestionSet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadQuestionSets();
        setIsEditing(false);
        // Show success message
        setValidationErrors([]);
      } else {
        const error = await response.json();
        setValidationErrors([error.detail || 'Failed to save question set']);
      }
    } catch (error) {
      setValidationErrors(['Network error occurred']);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewQuestionSet = async (demographicProfile?: any) => {
    try {
      const response = await fetch('/api/companies/question-sets/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          company_url: `company-${companyId}`, // This would be the actual company URL
          language: 'en',
          demographic_profile: demographicProfile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      }
    } catch (error) {
      console.error('Error previewing question set:', error);
    }
  };

  const handleTestQuestionSet = async () => {
    setIsTestMode(true);
    setTestResults([]);
    await handlePreviewQuestionSet();
  };

  const handleSubmitTestResult = (questionId: string, result: Omit<TestResult, 'question_id'>) => {
    setTestResults(prev => [
      ...prev.filter(r => r.question_id !== questionId),
      { question_id: questionId, ...result }
    ]);
  };

  const loadQuestionSetVersions = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/question-sets/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestionSetVersions(data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleRollbackToVersion = async (versionId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/question-sets/${versionId}/rollback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadQuestionSets();
        setShowVersionHistory(false);
      }
    } catch (error) {
      console.error('Error rolling back:', error);
    }
  };

  const handleExportQuestionSet = () => {
    if (!activeQuestionSet) return;
    
    const exportData = {
      ...activeQuestionSet,
      questions: allQuestions.filter(q => activeQuestionSet.base_questions.includes(q.id)),
      export_timestamp: new Date().toISOString(),
      company_name: companyName
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}-question-set-${activeQuestionSet.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportQuestionSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        setFormData({
          name: `${importData.name} (Imported)`,
          description: importData.description || '',
          base_questions: importData.base_questions || [],
          custom_questions: importData.custom_questions || [],
          excluded_questions: importData.excluded_questions || [],
          question_variations: importData.question_variations || {}
        });
        setIsEditing(true);
      } catch (error) {
        setValidationErrors(['Invalid import file format']);
      }
    };
    reader.readAsText(file);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.base_questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({ ...formData, base_questions: items });
  };

  const toggleQuestionSelection = (questionId: string) => {
    const isSelected = formData.base_questions.includes(questionId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        base_questions: formData.base_questions.filter(id => id !== questionId)
      });
    } else {
      setFormData({
        ...formData,
        base_questions: [...formData.base_questions, questionId]
      });
    }
  };

  const toggleQuestionExclusion = (questionId: string) => {
    const isExcluded = formData.excluded_questions.includes(questionId);
    
    if (isExcluded) {
      setFormData({
        ...formData,
        excluded_questions: formData.excluded_questions.filter(id => id !== questionId)
      });
    } else {
      setFormData({
        ...formData,
        excluded_questions: [...formData.excluded_questions, questionId]
      });
    }
  };

  const setQuestionVariation = (questionId: string, variationName: string) => {
    const newVariations = { ...formData.question_variations };
    
    if (variationName === 'default') {
      delete newVariations[questionId];
    } else {
      newVariations[questionId] = variationName;
    }
    
    setFormData({
      ...formData,
      question_variations: newVariations
    });
  };

  // Enhanced filtering and search
  const filteredQuestions = allQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFactor = filterFactor === 'all' || question.factor === filterFactor;
    return matchesSearch && matchesFactor;
  });

  const availableFactors = [...new Set(allQuestions.map(q => q.factor))];

  const getQuestionStats = () => {
    const totalQuestions = formData.base_questions.length + (formData.custom_questions?.length || 0);
    const excludedCount = formData.excluded_questions?.length || 0;
    const variationsCount = Object.keys(formData.question_variations).length;
    
    const factorDistribution = formData.base_questions.reduce((acc, qId) => {
      const question = allQuestions.find(q => q.id === qId);
      if (question) {
        acc[question.factor] = (acc[question.factor] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions,
      excludedCount,
      variationsCount,
      factorDistribution
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading question sets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Question Set Management</h2>
          <p className="text-muted-foreground">
            Manage custom question sets for {companyName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePreviewQuestionSet()}
            disabled={!activeQuestionSet}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={handleTestQuestionSet}
            disabled={!activeQuestionSet}
          >
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={loadQuestionSetVersions}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Question Set Version History</DialogTitle>
                <DialogDescription>
                  View and rollback to previous versions
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {questionSetVersions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{version.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()} • {version.total_questions} questions
                        </p>
                        {version.is_active && (
                          <Badge variant="default" className="mt-1">Current</Badge>
                        )}
                      </div>
                      {!version.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRollbackToVersion(version.id)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={handleExportQuestionSet}
            disabled={!activeQuestionSet}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportQuestionSet}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current">Current Set</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Question Set</CardTitle>
              <CardDescription>
                Currently active question set for this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeQuestionSet ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground">
                        {activeQuestionSet.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Questions</Label>
                      <p className="text-sm text-muted-foreground">
                        {activeQuestionSet.base_questions.length + 
                         (activeQuestionSet.custom_questions?.length || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {activeQuestionSet.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {activeQuestionSet.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Base Questions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeQuestionSet.base_questions.map((questionId) => (
                        <Badge key={questionId} variant="secondary">
                          {questionId}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {activeQuestionSet.excluded_questions && 
                   activeQuestionSet.excluded_questions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Excluded Questions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeQuestionSet.excluded_questions.map((questionId) => (
                          <Badge key={questionId} variant="destructive">
                            {questionId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No active question set found. Create one to get started.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setIsEditing(true)}
                  >
                    Create Question Set
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Question Set Builder</CardTitle>
                <CardDescription>
                  Create or modify question sets for this company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Question Set Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter question set name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base font-semibold">Question Selection</Label>
                      <p className="text-sm text-muted-foreground">
                        Select and order questions for this company's assessment
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getQuestionStats().totalQuestions} questions selected
                    </div>
                  </div>

                  {/* Question Stats */}
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {getQuestionStats().totalQuestions}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Questions</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {getQuestionStats().variationsCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Variations</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">
                            {getQuestionStats().excludedCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Excluded</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {Object.keys(getQuestionStats().factorDistribution).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Factors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Available Questions</Label>
                        <div className="flex gap-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search questions..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8 w-48"
                            />
                          </div>
                          <Select value={filterFactor} onValueChange={setFilterFactor}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Factors</SelectItem>
                              {availableFactors.map(factor => (
                                <SelectItem key={factor} value={factor}>
                                  {factor.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <ScrollArea className="border rounded-lg p-4 h-96">
                        {filteredQuestions.map((question) => (
                          <div
                            key={question.id}
                            className={`flex items-center space-x-2 p-3 hover:bg-muted rounded mb-2 border ${
                              formData.base_questions.includes(question.id) ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <Checkbox
                              checked={formData.base_questions.includes(question.id)}
                              onCheckedChange={() => toggleQuestionSelection(question.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{question.id}</p>
                                <Badge variant="outline" className="text-xs">
                                  Q{question.question_number}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.weight}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {question.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {question.factor.replace('_', ' ')}
                                </Badge>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Selected Questions</Label>
                        <div className="text-xs text-muted-foreground">
                          Drag to reorder • {formData.base_questions.length} selected
                        </div>
                      </div>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="selected-questions">
                          {(provided, snapshot) => (
                            <ScrollArea
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`border rounded-lg p-4 h-96 ${
                                snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''
                              }`}
                            >
                              {formData.base_questions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <p>No questions selected</p>
                                  <p className="text-xs">Select questions from the left panel</p>
                                </div>
                              ) : (
                                formData.base_questions.map((questionId, index) => {
                                  const question = allQuestions.find(q => q.id === questionId);
                                  const hasVariation = formData.question_variations[questionId];
                                  return (
                                    <Draggable
                                      key={questionId}
                                      draggableId={questionId}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`flex items-center space-x-3 p-3 rounded mb-2 border ${
                                            snapshot.isDragging 
                                              ? 'bg-white shadow-lg border-blue-300' 
                                              : 'bg-muted hover:bg-muted/80'
                                          }`}
                                        >
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="text-sm font-medium">{questionId}</p>
                                              <Badge variant="outline" className="text-xs">
                                                #{index + 1}
                                              </Badge>
                                              {hasVariation && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {hasVariation}
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                              {question?.text}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs">
                                                {question?.factor.replace('_', ' ')}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                Weight: {question?.weight}%
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => toggleQuestionExclusion(questionId)}
                                              title="Exclude question"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => toggleQuestionSelection(questionId)}
                                              title="Remove question"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })
                              )}
                              {provided.placeholder}
                            </ScrollArea>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreviewQuestionSet()}
                      disabled={formData.base_questions.length === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTestQuestionSet}
                      disabled={formData.base_questions.length === 0}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Test Questions
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveQuestionSet}
                      disabled={isSaving || formData.base_questions.length === 0}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Question Set
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Click "Edit" to modify the question set
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Start Editing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Variations</CardTitle>
              <CardDescription>
                Configure question variations for different demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.base_questions.map((questionId) => {
                  const variations = availableVariations.filter(
                    v => v.base_question_id === questionId
                  );
                  
                  return (
                    <div key={questionId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">{questionId}</Label>
                        <Badge variant="outline">
                          {variations.length} variations available
                        </Badge>
                      </div>
                      
                      <Select
                        value={formData.question_variations[questionId] || 'default'}
                        onValueChange={(value) => setQuestionVariation(questionId, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select variation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          {variations.map((variation) => (
                            <SelectItem key={variation.id} value={variation.variation_name}>
                              {variation.variation_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Set Preview</CardTitle>
              <CardDescription>
                Preview how the questions will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {previewData.questions?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {previewData.metadata?.demographic_rules_applied?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Rules Applied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {previewData.metadata?.language || 'en'}
                      </p>
                      <p className="text-sm text-muted-foreground">Language</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(previewData.questions?.reduce((sum: number, q: any) => sum + (q.weight || 0), 0) || 0)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Total Weight</p>
                    </div>
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {previewData.questions?.map((question: any, index: number) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="secondary">{question.factor?.replace('_', ' ')}</Badge>
                              {question.variation_used && (
                                <Badge variant="default">{question.variation_used}</Badge>
                              )}
                            </div>
                            <Badge variant="outline">{question.weight}%</Badge>
                          </div>
                          <p className="font-medium mb-3">{question.text}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {question.options?.map((option: any) => (
                              <div key={option.value} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {option.value}
                                </div>
                                <span className="text-sm">{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No preview data available. Click "Preview" to generate.
                  </p>
                  <Button onClick={() => handlePreviewQuestionSet()}>
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Set Testing</CardTitle>
              <CardDescription>
                Test the question set for usability and effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTestMode ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Testing Session Active</h3>
                      <p className="text-sm text-muted-foreground">
                        Rate each question for clarity, relevance, and difficulty
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsTestMode(false)}
                    >
                      End Testing
                    </Button>
                  </div>

                  {previewData && (
                    <div className="space-y-4">
                      <Progress 
                        value={(testResults.length / previewData.questions.length) * 100} 
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground text-center">
                        {testResults.length} of {previewData.questions.length} questions tested
                      </p>

                      <ScrollArea className="h-96">
                        {previewData.questions.map((question: any, index: number) => {
                          const existingResult = testResults.find(r => r.question_id === question.id);
                          return (
                            <Card key={question.id} className="mb-4">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <Badge variant="outline">Q{index + 1}</Badge>
                                  {existingResult && (
                                    <Badge variant="default">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Tested
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium mb-3">{question.text}</p>
                                
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                  <div>
                                    <Label className="text-xs">Clarity (1-5)</Label>
                                    <Select
                                      value={existingResult?.clarity_rating?.toString() || ''}
                                      onValueChange={(value) => {
                                        const result = existingResult || {
                                          response_time: 0,
                                          difficulty_rating: 3,
                                          relevance_rating: 3
                                        };
                                        handleSubmitTestResult(question.id, {
                                          ...result,
                                          clarity_rating: parseInt(value)
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Rate" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5].map(rating => (
                                          <SelectItem key={rating} value={rating.toString()}>
                                            {rating}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Relevance (1-5)</Label>
                                    <Select
                                      value={existingResult?.relevance_rating?.toString() || ''}
                                      onValueChange={(value) => {
                                        const result = existingResult || {
                                          response_time: 0,
                                          difficulty_rating: 3,
                                          clarity_rating: 3
                                        };
                                        handleSubmitTestResult(question.id, {
                                          ...result,
                                          relevance_rating: parseInt(value)
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Rate" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5].map(rating => (
                                          <SelectItem key={rating} value={rating.toString()}>
                                            {rating}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Difficulty (1-5)</Label>
                                    <Select
                                      value={existingResult?.difficulty_rating?.toString() || ''}
                                      onValueChange={(value) => {
                                        const result = existingResult || {
                                          response_time: 0,
                                          clarity_rating: 3,
                                          relevance_rating: 3
                                        };
                                        handleSubmitTestResult(question.id, {
                                          ...result,
                                          difficulty_rating: parseInt(value)
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Rate" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5].map(rating => (
                                          <SelectItem key={rating} value={rating.toString()}>
                                            {rating}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </ScrollArea>

                      {testResults.length === previewData.questions.length && (
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h3 className="font-semibold text-green-800">Testing Complete!</h3>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                              All questions have been tested. Here's a summary:
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-green-600">
                                  {(testResults.reduce((sum, r) => sum + r.clarity_rating, 0) / testResults.length).toFixed(1)}
                                </p>
                                <p className="text-xs text-green-700">Avg Clarity</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-green-600">
                                  {(testResults.reduce((sum, r) => sum + r.relevance_rating, 0) / testResults.length).toFixed(1)}
                                </p>
                                <p className="text-xs text-green-700">Avg Relevance</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-green-600">
                                  {(testResults.reduce((sum, r) => sum + r.difficulty_rating, 0) / testResults.length).toFixed(1)}
                                </p>
                                <p className="text-xs text-green-700">Avg Difficulty</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Start a testing session to evaluate question effectiveness
                  </p>
                  <Button onClick={handleTestQuestionSet} disabled={!activeQuestionSet}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Testing Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
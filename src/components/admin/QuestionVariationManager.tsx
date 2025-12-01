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
import {
  Plus, Edit, Trash2, TestTube, BarChart3,
  Languages, Building2, AlertTriangle, CheckCircle,
  Eye, Copy, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApiCall } from '@/hooks/use-admin-auth';

interface QuestionOption {
  value: number;
  label: string;
  label_en?: string;  // NEW: English label
  label_ar?: string;  // NEW: Arabic label
}

interface QuestionVariation {
  id: number;
  base_question_id: string;
  variation_name: string;
  language: string;
  text: string;
  options: QuestionOption[];
  demographic_rules?: any;
  company_ids?: number[];
  factor: string;
  weight: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at?: string;
}

interface BaseQuestion {
  id: string;
  question_number: number;
  text: string;
  factor: string;
  weight: number;
  existing_variations: number;
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  consistency_score: number;
}

interface VariationAnalytics {
  total_variations: number;
  active_variations: number;
  usage_rate: number;
  top_variations: Array<{
    variation_id: number;
    variation_name: string;
    base_question_id: string;
    usage_count: number;
  }>;
  language_distribution: Record<string, number>;
  company_specific_variations: number;
  analysis_period_days: number;
}

export function QuestionVariationManager() {
  const [variations, setVariations] = useState<QuestionVariation[]>([]);
  const [baseQuestions, setBaseQuestions] = useState<BaseQuestion[]>([]);
  const [analytics, setAnalytics] = useState<VariationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('list');

  // Filters
  const [filters, setFilters] = useState({
    base_question_id: 'all',
    language: 'all',
    active_only: true,
    page: 1,
    limit: 20
  });

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVariation, setEditingVariation] = useState<QuestionVariation | null>(null);
  const [formData, setFormData] = useState<{
    base_question_id: string;
    variation_name: string;
    language: string;
    text: string;
    text_en?: string;  // NEW: English question text
    text_ar?: string;  // NEW: Arabic question text
    options: QuestionOption[];
    demographic_rules: any;
    company_ids: number[] | null;
    is_active: boolean;
  }>({
    base_question_id: '',
    variation_name: '',
    language: 'en',
    text: '',
    text_en: '',  // NEW
    text_ar: '',  // NEW
    options: [
      { value: 1, label: '', label_en: '', label_ar: '' },
      { value: 2, label: '', label_en: '', label_ar: '' },
      { value: 3, label: '', label_en: '', label_ar: '' },
      { value: 4, label: '', label_en: '', label_ar: '' },
      { value: 5, label: '', label_en: '', label_ar: '' }
    ],
    demographic_rules: null,
    company_ids: null,
    is_active: true
  });

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [testingVariation, setTestingVariation] = useState(false);

  // Calculate form completion percentage
  const getFormCompletionPercentage = () => {
    let completed = 0;
    let total = 4; // 4 required steps

    if (formData.base_question_id) completed++;
    if (formData.variation_name.trim()) completed++;
    if (formData.text_en?.trim() && formData.text_ar?.trim()) completed++;  // Both languages required
    if (formData.options.every(opt => opt.label_en?.trim() && opt.label_ar?.trim())) completed++;  // Bilingual options

    return Math.round((completed / total) * 100);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load variations
      const apiFilters = {
        ...filters,
        base_question_id: filters.base_question_id === 'all' ? '' : filters.base_question_id,
        language: filters.language === 'all' ? '' : filters.language,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        active_only: filters.active_only.toString()
      };

      const variationsResponse = await adminApiCall(
        `/admin/question-variations?${new URLSearchParams(apiFilters)}`
      );

      console.log('Variations response status:', variationsResponse.status);

      if (variationsResponse.ok) {
        const variationsData = await variationsResponse.json();
        console.log('Variations data received:', variationsData);
        console.log('Setting variations count:', variationsData.variations?.length || 0);
        setVariations(variationsData.variations || []);
      } else {
        console.error('Failed to load variations:', variationsResponse.status, await variationsResponse.text());
        toast.error('Failed to load question variations');
      }

      // Load base questions
      console.log('Loading base questions...');
      const baseQuestionsResponse = await adminApiCall('/admin/question-variations/base-questions');
      console.log('Base questions response status:', baseQuestionsResponse.status);

      if (baseQuestionsResponse.ok) {
        const baseQuestionsData = await baseQuestionsResponse.json();
        console.log('Base questions loaded:', baseQuestionsData);
        setBaseQuestions(baseQuestionsData || []);
      } else {
        const errorText = await baseQuestionsResponse.text();
        console.error('Failed to load base questions:', errorText);
        toast.error('Failed to load base questions');
      }

      // Load analytics
      const analyticsResponse = await adminApiCall('/admin/question-variations/analytics/overview');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load question variations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariation = async () => {
    try {
      const response = await adminApiCall('/admin/question-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Question variation created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create variation');
      }
    } catch (error) {
      console.error('Error creating variation:', error);
      toast.error('Failed to create variation');
    }
  };

  const handleUpdateVariation = async (id: number) => {
    try {
      const updateData = {
        variation_name: formData.variation_name,
        text: formData.text,
        options: formData.options,
        demographic_rules: formData.demographic_rules,
        company_ids: formData.company_ids,
        is_active: formData.is_active
      };

      const response = await adminApiCall(`/admin/question-variations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Question variation updated successfully');
        setEditingVariation(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update variation');
      }
    } catch (error) {
      console.error('Error updating variation:', error);
      toast.error('Failed to update variation');
    }
  };

  const handleDeleteVariation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this variation?')) return;

    try {
      const response = await adminApiCall(`/admin/question-variations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Question variation deleted successfully');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to delete variation');
      }
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast.error('Failed to delete variation');
    }
  };

  const handleTestVariation = async () => {
    try {
      setTestingVariation(true);

      // Determine which text to validate based on language
      const textToValidate = formData.language === 'en' ? formData.text_en : formData.text_ar;

      const testRequest = {
        base_question_id: formData.base_question_id,
        text: textToValidate,  // Use the appropriate language text
        options: formData.options,
        language: formData.language,
        demographic_rules: formData.demographic_rules
      };

      const response = await adminApiCall('/admin/question-variations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest)
      });

      if (response.ok) {
        const result = await response.json();
        setValidation(result.validation);

        if (result.validation.is_valid) {
          toast.success(`Variation is valid (consistency: ${(result.validation.consistency_score * 100).toFixed(1)}%)`);
        } else {
          toast.warning('Variation has validation issues');
        }
      } else {
        toast.error('Failed to test variation');
      }
    } catch (error) {
      console.error('Error testing variation:', error);
      toast.error('Failed to test variation');
    } finally {
      setTestingVariation(false);
    }
  };

  const resetForm = () => {
    setFormData({
      base_question_id: '',
      variation_name: '',
      language: 'en',
      text: '',
      text_en: '',
      text_ar: '',
      options: [
        { value: 1, label: '', label_en: '', label_ar: '' },
        { value: 2, label: '', label_en: '', label_ar: '' },
        { value: 3, label: '', label_en: '', label_ar: '' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ],
      demographic_rules: null,
      company_ids: null,
      is_active: true
    });
    setValidation(null);
  };

  const startEdit = (variation: QuestionVariation) => {
    setEditingVariation(variation);
    setFormData({
      base_question_id: variation.base_question_id,
      variation_name: variation.variation_name,
      language: variation.language,
      text: variation.text,
      // For backwards compatibility: if text_en/text_ar don't exist, use text for both
      text_en: (variation as any).text_en || variation.text,
      text_ar: (variation as any).text_ar || variation.text,
      options: variation.options,
      demographic_rules: variation.demographic_rules ?? null,
      company_ids: variation.company_ids ?? null,
      is_active: variation.is_active
    });
  };

  const updateOption = (index: number, field: 'value' | 'label' | 'label_en' | 'label_ar', value: string | number) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading question variations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Question Variation Management</h2>
          <p className="text-muted-foreground">
            Create and manage question variations for different demographics and companies
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Variation
            </Button>
          </DialogTrigger>
          <DialogContent
            className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto"
            style={{ width: '95vw', maxWidth: '1400px' }}
          >
            <DialogHeader>
              <DialogTitle>Create Question Variation</DialogTitle>
              <DialogDescription>
                Create a new variation of an existing question for specific demographics or companies
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Form Completion</span>
                <span className="font-medium">{getFormCompletionPercentage()}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${getFormCompletionPercentage()}%` }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Step 1: Base Question Selection */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                    Select Base Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {baseQuestions.length === 0 ? (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        <strong>No base questions available.</strong> Please ensure the backend is running and the Financial Clinic questions are configured.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select
                      value={formData.base_question_id}
                      onValueChange={(value) => {
                        const selectedQuestion = baseQuestions.find(q => q.id === value);
                        setFormData({
                          ...formData,
                          base_question_id: value,
                          // Auto-populate variation name suggestion
                          variation_name: formData.variation_name || `${selectedQuestion?.factor || 'Custom'} Variation`
                        });
                      }}
                    >
                      <SelectTrigger className="h-auto min-h-[60px]">
                        <SelectValue placeholder="Select base question" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        {baseQuestions.map((question) => (
                          <SelectItem key={question.id} value={question.id} className="py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Q{question.question_number}</Badge>
                                <span className="font-medium">{question.factor}</span>
                                <Badge variant="secondary" className="ml-auto">
                                  {question.existing_variations} variations
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {question.text}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {formData.base_question_id && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-sm">
                        <strong>Selected:</strong> {baseQuestions.find(q => q.id === formData.base_question_id)?.text}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Variation Details */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                    Variation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="variation_name" className="flex items-center gap-2">
                        Variation Name
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </Label>
                      <Input
                        id="variation_name"
                        value={formData.variation_name}
                        onChange={(e) => setFormData({ ...formData, variation_name: e.target.value })}
                        placeholder="e.g., UAE Citizen Version"
                      />
                      <p className="text-xs text-muted-foreground">
                        Give this variation a descriptive name
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="flex items-center gap-2">
                        Language
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">
                            <div className="flex items-center gap-2">
                              <Languages className="w-4 h-4" />
                              English
                            </div>
                          </SelectItem>
                          <SelectItem value="ar">
                            <div className="flex items-center gap-2">
                              <Languages className="w-4 h-4" />
                              Arabic (العربية)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the language for this variation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Question Text (Bilingual) */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                    Question Text (Bilingual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* English Question Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="text_en" className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Question Text (English)
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </Label>
                      <span className={`text-xs ${(formData.text_en?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {formData.text_en?.length || 0} characters
                      </span>
                    </div>
                    <Textarea
                      id="text_en"
                      value={formData.text_en || ''}
                      onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                      placeholder="Enter the question text in English"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Arabic Question Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="text_ar" className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Question Text (Arabic)
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </Label>
                      <span className={`text-xs ${(formData.text_ar?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {formData.text_ar?.length || 0} characters
                      </span>
                    </div>
                    <Textarea
                      id="text_ar"
                      value={formData.text_ar || ''}
                      onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
                      placeholder="أدخل نص السؤال بالعربية"
                      rows={3}
                      className="resize-none text-right"
                      dir="rtl"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Write clear, concise questions for your target audience in both languages
                  </p>
                </CardContent>
              </Card>

              {/* Step 4: Answer Options (Bilingual) */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                    Answer Options (Bilingual)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="w-8 text-center">
                            {option.value}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            Option {index + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* English Label */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              English
                            </Label>
                            <Input
                              value={option.label_en || ''}
                              onChange={(e) => updateOption(index, 'label_en', e.target.value)}
                              placeholder="English label"
                              className="text-sm"
                            />
                          </div>

                          {/* Arabic Label */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              Arabic
                            </Label>
                            <Input
                              value={option.label_ar || ''}
                              onChange={(e) => updateOption(index, 'label_ar', e.target.value)}
                              placeholder="النص بالعربية"
                              className="text-sm text-right"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Tip: Provide translations for all 5 answer options in both English and Arabic
                  </p>
                </CardContent>
              </Card>

              {/* Step 5: Validation */}
              {validation && (
                <Card className={`border-2 ${validation.is_valid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {validation.is_valid ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700">Validation Passed</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-red-700">Validation Issues Found</span>
                        </>
                      )}
                      <Badge variant={validation.is_valid ? "default" : "destructive"} className="ml-auto">
                        {(validation.consistency_score * 100).toFixed(1)}% consistent
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {validation.errors.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Errors ({validation.errors.length})
                          </p>
                          <ul className="space-y-1">
                            {validation.errors.map((error, index) => (
                              <li key={index} className="text-sm bg-white border border-red-200 rounded p-2 flex items-start gap-2">
                                <span className="text-red-600 mt-0.5">•</span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-yellow-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Warnings ({validation.warnings.length})
                          </p>
                          <ul className="space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <li key={index} className="text-sm bg-white border border-yellow-200 rounded p-2 flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">⚠</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.is_valid && validation.errors.length === 0 && validation.warnings.length === 0 && (
                        <div className="text-sm text-green-700 flex items-center gap-2 bg-white border border-green-200 rounded p-3">
                          <CheckCircle className="w-4 h-4" />
                          <span>All checks passed! Your variation is ready to be created.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestVariation}
                    disabled={!formData.base_question_id || !formData.text_en || !formData.text_ar || !formData.variation_name || testingVariation}
                    className="gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    {testingVariation ? 'Validating...' : 'Validate Variation'}
                  </Button>

                  {!validation && formData.base_question_id && formData.text_en && formData.text_ar && formData.variation_name && (
                    <span className="text-xs text-muted-foreground">
                      Click "Validate" to check your variation
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVariation}
                    disabled={!validation?.is_valid}
                    className="gap-2"
                  >
                    {validation?.is_valid ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create Variation
                      </>
                    ) : (
                      <>
                        Create Variation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="list">Variations List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Base Question</Label>
                  <Select
                    value={filters.base_question_id}
                    onValueChange={(value) => setFilters({ ...filters, base_question_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All questions</SelectItem>
                      {baseQuestions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          Q{question.question_number}: {question.text.substring(0, 40)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={filters.language}
                    onValueChange={(value) => setFilters({ ...filters, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="active_only"
                    checked={filters.active_only}
                    onCheckedChange={(checked) => setFilters({ ...filters, active_only: checked })}
                  />
                  <Label htmlFor="active_only">Active only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Question Variations</CardTitle>
              <CardDescription>
                {variations.length} variations found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variation</TableHead>
                      <TableHead>Base Question</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No question variations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      variations.map((variation) => (
                        <TableRow key={variation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{variation.variation_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {variation.text.substring(0, 60)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {variation.base_question_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Languages className="w-4 h-4" />
                              {variation.language.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {variation.usage_count} uses
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={variation.is_active ? "default" : "secondary"}>
                              {variation.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(variation)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVariation(variation.id)}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Variations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_variations}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.active_variations} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(analytics.usage_rate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Of surveys use variations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.keys(analytics.language_distribution).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported languages
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Company Specific</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.company_specific_variations}</div>
                    <p className="text-xs text-muted-foreground">
                      Company variations
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Variations */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Variations</CardTitle>
                  <CardDescription>
                    Top performing question variations by usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.top_variations.map((variation, index) => (
                      <div key={variation.variation_id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{variation.variation_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {variation.base_question_id}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {variation.usage_count} uses
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

      {/* Edit Dialog */}
      {editingVariation && (
        <Dialog open={!!editingVariation} onOpenChange={() => setEditingVariation(null)}>
          <DialogContent
            className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto"
            style={{ width: '95vw', maxWidth: '1400px' }}
          >
            <DialogHeader>
              <DialogTitle>Edit Question Variation</DialogTitle>
              <DialogDescription>
                Modify the question variation details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Variation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_variation_name">Variation Name</Label>
                  <Input
                    id="edit_variation_name"
                    value={formData.variation_name}
                    onChange={(e) => setFormData({ ...formData, variation_name: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="edit_is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="edit_is_active">Active</Label>
                </div>
              </div>

              {/* Question Text (Bilingual) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit_text_en" className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Question Text (English)
                    </Label>
                    <span className={`text-xs ${(formData.text_en?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {formData.text_en?.length || 0} characters
                    </span>
                  </div>
                  <Textarea
                    id="edit_text_en"
                    value={formData.text_en || ''}
                    onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                    placeholder="Enter the question text in English"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit_text_ar" className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Question Text (Arabic)
                    </Label>
                    <span className={`text-xs ${(formData.text_ar?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {formData.text_ar?.length || 0} characters
                    </span>
                  </div>
                  <Textarea
                    id="edit_text_ar"
                    value={formData.text_ar || ''}
                    onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
                    placeholder="أدخل نص السؤال بالعربية"
                    rows={3}
                    className="resize-none text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Answer Options (Bilingual) */}
              <div className="space-y-2">
                <Label>Answer Options (Bilingual)</Label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="w-8 text-center">
                          {option.value}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          Option {index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* English Label */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            English
                          </Label>
                          <Input
                            value={option.label_en || ''}
                            onChange={(e) => updateOption(index, 'label_en', e.target.value)}
                            placeholder="English label"
                            className="text-sm"
                          />
                        </div>

                        {/* Arabic Label */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            Arabic
                          </Label>
                          <Input
                            value={option.label_ar || ''}
                            onChange={(e) => updateOption(index, 'label_ar', e.target.value)}
                            placeholder="النص بالعربية"
                            className="text-sm text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingVariation(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateVariation(editingVariation.id)}>
                  Update Variation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
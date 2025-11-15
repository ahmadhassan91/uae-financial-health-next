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
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Edit, Trash2, Languages, CheckCircle, 
  Clock, AlertTriangle, Download, Upload,
  FileText, Globe, Workflow, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApiCall } from '@/hooks/use-admin-auth';

interface LocalizedContent {
  id: number;
  content_type: string;
  content_id: string;
  language: string;
  title?: string;
  text: string;
  options?: any[];
  extra_data?: any;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface TranslationWorkflow {
  workflow_id: string;
  status: string;
  content_items: Array<{
    content_id: string;
    content_type: string;
    source_text: string;
    target_text?: string;
    status: string;
    quality_score?: number;
  }>;
  estimated_completion?: string;
  assigned_translator?: string;
  created_at: string;
}

interface LocalizationAnalytics {
  total_content_items: number;
  translated_items: number;
  translation_coverage: Record<string, number>;
  pending_translations: number;
  quality_scores: Record<string, number>;
  most_requested_content: Array<{
    content_type: string;
    content_id: string;
    request_count: number;
  }>;
  analysis_period_days: number;
}

const CONTENT_TYPES = [
  { value: 'question', label: 'Question' },
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'ui', label: 'UI Element' }
];

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'Arabic', flag: '🇦🇪' }
];

const WORKFLOW_TYPES = [
  { value: 'manual', label: 'Manual Translation' },
  { value: 'automatic', label: 'Automatic Translation' },
  { value: 'hybrid', label: 'Hybrid (Auto + Review)' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export function LocalizationManager() {
  const [content, setContent] = useState<LocalizedContent[]>([]);
  const [workflows, setWorkflows] = useState<TranslationWorkflow[]>([]);
  const [analytics, setAnalytics] = useState<LocalizationAnalytics | null>({
    total_content_items: 0,
    translated_items: 0,
    translation_coverage: {},
    pending_translations: 0,
    quality_scores: {},
    most_requested_content: [],
    analysis_period_days: 30
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('content');
  
  // Filters
  const [filters, setFilters] = useState({
    content_type: 'all',
    language: 'all',
    active_only: true,
    page: 1,
    limit: 20
  });
  
  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<LocalizedContent | null>(null);
  const [formData, setFormData] = useState({
    content_type: 'question',
    content_id: '',
    language: 'ar',
    title: '',
    text: '',
    options: [],
    extra_data: null,
    version: '1.0',
    is_active: true
  });
  
  // Workflow form state
  const [workflowData, setWorkflowData] = useState({
    content_ids: [],
    source_language: 'en',
    target_language: 'ar',
    workflow_type: 'manual',
    priority: 'normal',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load localized content
      const apiFilters = {
        ...filters,
        content_type: filters.content_type === 'all' ? '' : filters.content_type,
        language: filters.language === 'all' ? '' : filters.language,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        active_only: filters.active_only.toString()
      };
      
      const contentResponse = await adminApiCall(
        `/api/admin/simple/localized-content`
      );
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContent(contentData.content || []);
      }
      
      // Load translation workflows
      const workflowsResponse = await adminApiCall('/api/admin/simple/translation-workflows');
      if (workflowsResponse.ok) {
        const workflowsData = await workflowsResponse.json();
        setWorkflows(workflowsData.workflows || []);
      }
      
      // Load analytics
      const analyticsResponse = await adminApiCall('/api/admin/simple/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load localization data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      const response = await adminApiCall('/api/admin/localized-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Localized content created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    }
  };

  const handleUpdateContent = async (id: number) => {
    try {
      const updateData = {
        title: formData.title,
        text: formData.text,
        options: formData.options,
        extra_data: formData.extra_data,
        version: formData.version,
        is_active: formData.is_active
      };
      
      const response = await adminApiCall(`/api/admin/localized-content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        toast.success('Localized content updated successfully');
        setEditingContent(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await adminApiCall(`/api/admin/localized-content/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Localized content deleted successfully');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const response = await adminApiCall('/api/admin/translation-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      
      if (response.ok) {
        toast.success('Translation workflow created successfully');
        setShowWorkflowDialog(false);
        resetWorkflowForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      content_type: 'question',
      content_id: '',
      language: 'ar',
      title: '',
      text: '',
      options: [],
      extra_data: null,
      version: '1.0',
      is_active: true
    });
  };

  const resetWorkflowForm = () => {
    setWorkflowData({
      content_ids: [],
      source_language: 'en',
      target_language: 'ar',
      workflow_type: 'manual',
      priority: 'normal',
      notes: ''
    });
  };

  const startEdit = (contentItem: LocalizedContent) => {
    setEditingContent(contentItem);
    setFormData({
      content_type: contentItem.content_type,
      content_id: contentItem.content_id,
      language: contentItem.language,
      title: contentItem.title || '',
      text: contentItem.text,
      options: contentItem.options || [],
      extra_data: contentItem.extra_data,
      version: contentItem.version,
      is_active: contentItem.is_active
    });
  };

  const createArabicTranslation = (englishItem: LocalizedContent) => {
    setEditingContent(null);
    setFormData({
      content_type: englishItem.content_type,
      content_id: englishItem.content_id,
      language: 'ar',
      title: '',
      text: '',
      options: englishItem.options || [],
      extra_data: englishItem.extra_data,
      version: englishItem.version,
      is_active: true
    });
    setShowCreateDialog(true);
  };

  const createEnglishTranslation = (arabicItem: LocalizedContent) => {
    setEditingContent(null);
    setFormData({
      content_type: arabicItem.content_type,
      content_id: arabicItem.content_id,
      language: 'en',
      title: '',
      text: '',
      options: arabicItem.options || [],
      extra_data: arabicItem.extra_data,
      version: arabicItem.version,
      is_active: true
    });
    setShowCreateDialog(true);
  };

  const getGroupedContent = () => {
    // Group content by content_id to show English and Arabic side by side
    const grouped = new Map();
    
    content.forEach(item => {
      if (!grouped.has(item.content_id)) {
        grouped.set(item.content_id, {
          content_id: item.content_id,
          content_type: item.content_type,
          english: null,
          arabic: null
        });
      }
      
      const group = grouped.get(item.content_id);
      if (item.language === 'en') {
        group.english = item;
      } else if (item.language === 'ar') {
        group.arabic = item;
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => {
      // Sort by content_type first, then by content_id
      if (a.content_type !== b.content_type) {
        return a.content_type.localeCompare(b.content_type);
      }
      return a.content_id.localeCompare(b.content_id);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading localization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Localization Management</h2>
          <p className="text-muted-foreground">
            Manage translations and localized content for multiple languages
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetWorkflowForm}>
                <Workflow className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Translation Workflow</DialogTitle>
                <DialogDescription>
                  Set up a translation workflow for multiple content items
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Language</Label>
                    <Select 
                      value={workflowData.source_language} 
                      onValueChange={(value) => setWorkflowData({ ...workflowData, source_language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Target Language</Label>
                    <Select 
                      value={workflowData.target_language} 
                      onValueChange={(value) => setWorkflowData({ ...workflowData, target_language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Type</Label>
                    <Select 
                      value={workflowData.workflow_type} 
                      onValueChange={(value) => setWorkflowData({ ...workflowData, workflow_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKFLOW_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={workflowData.priority} 
                      onValueChange={(value) => setWorkflowData({ ...workflowData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Content IDs</Label>
                  <Input
                    value={workflowData.content_ids.join(', ')}
                    onChange={(e) => setWorkflowData({ 
                      ...workflowData, 
                      content_ids: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                    })}
                    placeholder="q1, q2, rec1, ui_welcome..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={workflowData.notes}
                    onChange={(e) => setWorkflowData({ ...workflowData, notes: e.target.value })}
                    placeholder="Additional instructions for translators"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkflow}>
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Localized Content</DialogTitle>
                <DialogDescription>
                  Create new localized content for questions, recommendations, or UI elements
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Select 
                      value={formData.content_type} 
                      onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => setFormData({ ...formData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Content ID</Label>
                  <Input
                    value={formData.content_id}
                    onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                    placeholder="e.g., q1, rec_budgeting, ui_welcome"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Title (Optional)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Content title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Localized text content"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateContent}>
                    Create Content
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={filters.content_type} 
                    onValueChange={(value) => setFilters({ ...filters, content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </SelectItem>
                      ))}
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

          {/* Content Table */}
          <Card>
            <CardHeader>
              <CardTitle>Localized Content</CardTitle>
              <CardDescription>
                {content.length} content items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content Key</TableHead>
                      <TableHead>English Text</TableHead>
                      <TableHead>Arabic Text</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No localized content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getGroupedContent().map((group) => (
                        <TableRow key={group.content_id}>
                          <TableCell>
                            <div className="font-medium">{group.content_id}</div>
                            <div className="text-xs text-muted-foreground">
                              {group.content_type}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">
                              {group.english ? (
                                <div>
                                  <div className="font-medium text-blue-600">EN</div>
                                  <div className="text-muted-foreground">
                                    {group.english.text.length > 100 
                                      ? `${group.english.text.substring(0, 100)}...`
                                      : group.english.text
                                    }
                                  </div>
                                </div>
                              ) : (
                                <div className="text-red-500 text-xs">Missing English</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">
                              {group.arabic ? (
                                <div>
                                  <div className="font-medium text-green-600">AR</div>
                                  <div className="text-muted-foreground" dir="rtl">
                                    {group.arabic.text.length > 100 
                                      ? `${group.arabic.text.substring(0, 100)}...`
                                      : group.arabic.text
                                    }
                                  </div>
                                </div>
                              ) : (
                                <div className="text-red-500 text-xs">Missing Arabic</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {group.content_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {group.english && (
                                <Badge variant={group.english.is_active ? "default" : "secondary"} className="text-xs">
                                  EN: {group.english.is_active ? "Active" : "Inactive"}
                                </Badge>
                              )}
                              {group.arabic && (
                                <Badge variant={group.arabic.is_active ? "default" : "secondary"} className="text-xs">
                                  AR: {group.arabic.is_active ? "Active" : "Inactive"}
                                </Badge>
                              )}
                              {!group.english && !group.arabic && (
                                <Badge variant="destructive" className="text-xs">No translations</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {group.english && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(group.english)}
                                  title="Edit English"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {group.arabic && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(group.arabic)}
                                  title="Edit Arabic"
                                >
                                  <Edit className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              {!group.arabic && group.english && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => createArabicTranslation(group.english)}
                                  title="Add Arabic Translation"
                                >
                                  <Plus className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              {!group.english && group.arabic && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => createEnglishTranslation(group.arabic)}
                                  title="Add English Translation"
                                >
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
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

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Workflows</CardTitle>
              <CardDescription>
                Active and completed translation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No translation workflows found
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <Card key={workflow.workflow_id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Workflow {workflow.workflow_id}
                            </CardTitle>
                            <CardDescription>
                              {workflow.content_items.length} content items
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(workflow.status)}
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {workflow.content_items.filter(item => item.status === 'completed').length} / {workflow.content_items.length}
                              </span>
                            </div>
                            <Progress 
                              value={(workflow.content_items.filter(item => item.status === 'completed').length / workflow.content_items.length) * 100}
                              className="h-2"
                            />
                          </div>
                          
                          {/* Content Items */}
                          <div className="space-y-2">
                            {workflow.content_items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.content_type}
                                  </Badge>
                                  <span>{item.content_id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.quality_score && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      <span className="text-xs">{item.quality_score.toFixed(1)}</span>
                                    </div>
                                  )}
                                  <Badge className={getStatusColor(item.status)} variant="secondary">
                                    {item.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {workflow.content_items.length > 3 && (
                              <div className="text-center text-sm text-muted-foreground">
                                +{workflow.content_items.length - 3} more items
                              </div>
                            )}
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                            {workflow.assigned_translator && (
                              <span>Translator: {workflow.assigned_translator}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.total_content_items || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Content items
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Translated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.translated_items || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics?.total_content_items && analytics?.translated_items 
                        ? ((analytics.translated_items / analytics.total_content_items) * 100).toFixed(1) 
                        : '0'}% coverage
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.pending_translations || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting translation
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.quality_scores && Object.values(analytics.quality_scores).length > 0 
                        ? (Object.values(analytics.quality_scores).reduce((a, b) => a + b, 0) / Object.values(analytics.quality_scores).length).toFixed(1)
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average quality
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Translation Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle>Translation Coverage by Language</CardTitle>
                  <CardDescription>
                    Percentage of content translated for each language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.translation_coverage ? Object.entries(analytics.translation_coverage).map(([language, coverage]) => (
                      <div key={language} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            <span className="font-medium">{language.toUpperCase()}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(coverage * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={coverage * 100} className="h-2" />
                      </div>
                    )) : <div className="text-sm text-muted-foreground">No coverage data available</div>}
                  </div>
                </CardContent>
              </Card>
              
              {/* Most Requested Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Requested Content</CardTitle>
                  <CardDescription>
                    Content items with highest translation requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics?.most_requested_content ? analytics.most_requested_content.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{item.content_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.content_type}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {item.request_count} requests
                        </Badge>
                      </div>
                    )) : <div className="text-sm text-muted-foreground">No request data available</div>}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Localized Content</DialogTitle>
              <DialogDescription>
                Modify the localized content
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title (Optional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
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
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingContent(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateContent(editingContent.id)}>
                  Update Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
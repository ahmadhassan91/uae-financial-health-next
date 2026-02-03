import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Edit, Trash2, Copy, Package, Building2,
  CheckCircle, AlertTriangle, Eye, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApiCall } from '@/hooks/use-admin-auth';

interface QuestionVariation {
  id: number;
  base_question_id: string;
  variation_name: string;
  text_en: string;
  text_ar: string;
}

interface VariationSet {
  id: number;
  name: string;
  description: string | null;
  set_type: 'industry' | 'demographic' | 'language' | 'custom';
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  companies_using_count?: number;
  q1_variation_id: number;
  q2_variation_id: number;
  q3_variation_id: number;
  q4_variation_id: number;
  q5_variation_id: number;
  q6_variation_id: number;
  q7_variation_id: number;
  q8_variation_id: number;
  q9_variation_id: number;
  q10_variation_id: number;
  q11_variation_id: number;
  q12_variation_id: number;
  q13_variation_id: number;
  q14_variation_id: number;
  q15_variation_id: number;
}

interface VariationSetFormData {
  name: string;
  description: string;
  set_type: 'industry' | 'demographic' | 'language' | 'custom';
  is_template: boolean;
  is_active: boolean;
  q1_variation_id: number | '';
  q2_variation_id: number | '';
  q3_variation_id: number | '';
  q4_variation_id: number | '';
  q5_variation_id: number | '';
  q6_variation_id: number | '';
  q7_variation_id: number | '';
  q8_variation_id: number | '';
  q9_variation_id: number | '';
  q10_variation_id: number | '';
  q11_variation_id: number | '';
  q12_variation_id: number | '';
  q13_variation_id: number | '';
  q14_variation_id: number | '';
  q15_variation_id: number | '';
}

export function VariationSetManager() {
  const [variationSets, setVariationSets] = useState<VariationSet[]>([]);
  const [availableVariations, setAvailableVariations] = useState<QuestionVariation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    set_type: 'all',
    is_template: 'all',
    is_active: 'all',
    search: '',
    page: 1,
    page_size: 20
  });

  // Pagination
  const [totalSets, setTotalSets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSet, setEditingSet] = useState<VariationSet | null>(null);
  const [viewingSet, setViewingSet] = useState<VariationSet | null>(null);
  const [formData, setFormData] = useState<VariationSetFormData>({
    name: '',
    description: '',
    set_type: 'custom',
    is_template: false,
    is_active: true,
    q1_variation_id: '',
    q2_variation_id: '',
    q3_variation_id: '',
    q4_variation_id: '',
    q5_variation_id: '',
    q6_variation_id: '',
    q7_variation_id: '',
    q8_variation_id: '',
    q9_variation_id: '',
    q10_variation_id: '',
    q11_variation_id: '',
    q12_variation_id: '',
    q13_variation_id: '',
    q14_variation_id: '',
    q15_variation_id: ''
  });

  // Load data on mount and filter changes
  useEffect(() => {
    loadVariationSets();
    loadAvailableVariations();
  }, [filters]);

  const loadVariationSets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        page_size: filters.page_size.toString()
      });

      if (filters.set_type !== 'all') params.append('set_type', filters.set_type);
      if (filters.is_template !== 'all') params.append('is_template', filters.is_template);
      if (filters.is_active !== 'all') params.append('is_active', filters.is_active);
      if (filters.search) params.append('search', filters.search);

      const response = await adminApiCall(`/admin/variation-sets?${params}`);

      if (response.ok) {
        const data = await response.json();
        setVariationSets(data.variation_sets);
        setTotalSets(data.total);
        setTotalPages(data.total_pages);
      } else {
        throw new Error('Failed to load variation sets');
      }
    } catch (error) {
      console.error('Error loading variation sets:', error);
      toast.error('Failed to load variation sets');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVariations = async () => {
    try {
      // Load all variations (active and inactive) for selection
      // Note: trailing slash is required by FastAPI router
      // Note: backend has max limit of 100, so we need to fetch multiple pages
      let allVariations: QuestionVariation[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await adminApiCall(`/admin/question-variations/?limit=100&page=${page}`);

        if (response.ok) {
          const data = await response.json();
          allVariations = [...allVariations, ...data.variations];

          // Check if there are more pages
          hasMore = data.variations.length === 100 && allVariations.length < data.total;
          page++;
        } else {
          console.error('Failed to load variations:', await response.text());
          hasMore = false;
        }
      }

      console.log('📊 Loaded variations:', allVariations.length, 'variations');
      console.log('📊 Sample variation:', allVariations[0]);
      setAvailableVariations(allVariations);
    } catch (error) {
      console.error('Error loading variations:', error);
    }
  };

  const getVariationsForQuestion = (questionNumber: number) => {
    // Filter variations by question number (base_question_id is stored as "fc_q1", "fc_q2", etc.)
    const questionId = `fc_q${questionNumber}`;
    const filtered = availableVariations.filter(v => v.base_question_id === questionId);

    // Debug logging
    if (questionNumber === 1) {
      console.log(`🔍 Getting variations for Q${questionNumber} (${questionId}):`, {
        totalVariations: availableVariations.length,
        filteredCount: filtered.length,
        sampleBaseIds: availableVariations.slice(0, 5).map(v => v.base_question_id),
        filtered: filtered.map(v => ({ id: v.id, name: v.variation_name }))
      });
    }

    return filtered;
  };

  const handleCreate = async () => {
    try {
      // Validate all questions have variations selected
      for (let i = 1; i <= 15; i++) {
        const key = `q${i}_variation_id` as keyof VariationSetFormData;
        if (!formData[key]) {
          toast.error(`Please select a variation for Question ${i}`);
          return;
        }
      }

      const payload = {
        ...formData,
        q1_variation_id: Number(formData.q1_variation_id),
        q2_variation_id: Number(formData.q2_variation_id),
        q3_variation_id: Number(formData.q3_variation_id),
        q4_variation_id: Number(formData.q4_variation_id),
        q5_variation_id: Number(formData.q5_variation_id),
        q6_variation_id: Number(formData.q6_variation_id),
        q7_variation_id: Number(formData.q7_variation_id),
        q8_variation_id: Number(formData.q8_variation_id),
        q9_variation_id: Number(formData.q9_variation_id),
        q10_variation_id: Number(formData.q10_variation_id),
        q11_variation_id: Number(formData.q11_variation_id),
        q12_variation_id: Number(formData.q12_variation_id),
        q13_variation_id: Number(formData.q13_variation_id),
        q14_variation_id: Number(formData.q14_variation_id),
        q15_variation_id: Number(formData.q15_variation_id)
      };

      const response = await adminApiCall('/admin/variation-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Variation set created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadVariationSets();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create variation set');
      }
    } catch (error: any) {
      console.error('Error creating variation set:', error);
      toast.error(error.message || 'Failed to create variation set');
    }
  };

  const handleUpdate = async () => {
    if (!editingSet) return;

    try {
      const payload: any = { ...formData };

      // Convert to numbers, only include changed fields
      for (let i = 1; i <= 15; i++) {
        const key = `q${i}_variation_id` as keyof VariationSetFormData;
        if (formData[key]) {
          payload[key] = Number(formData[key]);
        }
      }

      const response = await adminApiCall(`/admin/variation-sets/${editingSet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Variation set updated successfully');
        setEditingSet(null);
        resetForm();
        loadVariationSets();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update variation set');
      }
    } catch (error: any) {
      console.error('Error updating variation set:', error);
      toast.error(error.message || 'Failed to update variation set');
    }
  };

  const handleDelete = async (setId: number) => {
    if (!confirm('Are you sure you want to delete this variation set? This cannot be undone.')) {
      return;
    }

    try {
      const response = await adminApiCall(`/admin/variation-sets/${setId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Variation set deleted successfully');
        loadVariationSets();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete variation set');
      }
    } catch (error: any) {
      console.error('Error deleting variation set:', error);
      toast.error(error.message || 'Failed to delete variation set');
    }
  };

  const handleClone = async (setId: number) => {
    const newName = prompt('Enter a name for the cloned variation set:');
    if (!newName) return;

    try {
      const response = await adminApiCall(`/admin/variation-sets/${setId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newName, new_description: `Cloned set` })
      });

      if (response.ok) {
        toast.success('Variation set cloned successfully');
        loadVariationSets();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to clone variation set');
      }
    } catch (error: any) {
      console.error('Error cloning variation set:', error);
      toast.error(error.message || 'Failed to clone variation set');
    }
  };

  const startEdit = (set: VariationSet) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      description: set.description || '',
      set_type: set.set_type,
      is_template: set.is_template,
      is_active: set.is_active,
      q1_variation_id: set.q1_variation_id,
      q2_variation_id: set.q2_variation_id,
      q3_variation_id: set.q3_variation_id,
      q4_variation_id: set.q4_variation_id,
      q5_variation_id: set.q5_variation_id,
      q6_variation_id: set.q6_variation_id,
      q7_variation_id: set.q7_variation_id,
      q8_variation_id: set.q8_variation_id,
      q9_variation_id: set.q9_variation_id,
      q10_variation_id: set.q10_variation_id,
      q11_variation_id: set.q11_variation_id,
      q12_variation_id: set.q12_variation_id,
      q13_variation_id: set.q13_variation_id,
      q14_variation_id: set.q14_variation_id,
      q15_variation_id: set.q15_variation_id
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      set_type: 'custom',
      is_template: false,
      is_active: true,
      q1_variation_id: '',
      q2_variation_id: '',
      q3_variation_id: '',
      q4_variation_id: '',
      q5_variation_id: '',
      q6_variation_id: '',
      q7_variation_id: '',
      q8_variation_id: '',
      q9_variation_id: '',
      q10_variation_id: '',
      q11_variation_id: '',
      q12_variation_id: '',
      q13_variation_id: '',
      q14_variation_id: '',
      q15_variation_id: ''
    });
  };

  const getSetTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      industry: 'bg-blue-100 text-blue-800',
      demographic: 'bg-purple-100 text-purple-800',
      language: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type] || colors.custom}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Question Variation Sets
              </CardTitle>
              <CardDescription>
                Manage bundled sets of 15 question variations for easy company assignment
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Set
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sets..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Set Type</Label>
              <Select value={filters.set_type} onValueChange={(value) => setFilters({ ...filters, set_type: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="demographic">Demographic</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template</Label>
              <Select value={filters.is_template} onValueChange={(value) => setFilters({ ...filters, is_template: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Templates Only</SelectItem>
                  <SelectItem value="false">Non-Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.is_active} onValueChange={(value) => setFilters({ ...filters, is_active: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    set_type: 'all',
                    is_template: 'all',
                    is_active: 'all',
                    search: '',
                    page: 1,
                    page_size: 20
                  });
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Summary */}
          <Alert className="mb-4">
            <AlertDescription>
              <strong>{totalSets}</strong> variation sets found
              {filters.is_template === 'true' && ' (templates only)'}
              {filters.is_active === 'false' && ' (inactive only)'}
            </AlertDescription>
          </Alert>

          {/* Variation Control Info */}
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>New Feature:</strong> Variations must now be explicitly enabled for each company.
              Companies with variations disabled will see default questions regardless of company URL.
              Use the API endpoints to manage variation settings per company.
            </AlertDescription>
          </Alert>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">Loading variation sets...</div>
          ) : variationSets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No variation sets found. Create your first set to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Companies Using</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variationSets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {set.name}
                          {set.is_template && (
                            <Badge variant="outline" className="text-xs">Template</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSetTypeBadge(set.set_type)}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {set.description || <span className="text-gray-400">No description</span>}
                      </TableCell>
                      <TableCell>
                        {set.is_active ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Building2 className="h-3 w-3 mr-1" />
                          {set.companies_using_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(set.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingSet(set)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(set)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClone(set.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(set.id)}
                            disabled={(set.companies_using_count || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Page {filters.page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Variation Set</DialogTitle>
            <DialogDescription>
              Create a new set of 15 question variations that can be assigned to companies
            </DialogDescription>
          </DialogHeader>
          <VariationSetForm
            formData={formData}
            setFormData={setFormData}
            availableVariations={availableVariations}
            getVariationsForQuestion={getVariationsForQuestion}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSet} onOpenChange={(open) => !open && setEditingSet(null)}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Variation Set</DialogTitle>
            <DialogDescription>
              Update the variation set configuration
            </DialogDescription>
          </DialogHeader>
          <VariationSetForm
            formData={formData}
            setFormData={setFormData}
            availableVariations={availableVariations}
            getVariationsForQuestion={getVariationsForQuestion}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingSet(null);
              resetForm();
            }}
            isEditing
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingSet} onOpenChange={(open) => !open && setViewingSet(null)}>
        <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingSet?.name}</DialogTitle>
            <DialogDescription>
              View complete variation set details
            </DialogDescription>
          </DialogHeader>
          {viewingSet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="mt-1">{getSetTypeBadge(viewingSet.set_type)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {viewingSet.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              {viewingSet.description && (
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm text-gray-600">{viewingSet.description}</p>
                </div>
              )}

              <div>
                <Label>Companies Using This Set</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {viewingSet.companies_using_count || 0} companies
                </p>
              </div>

              <div>
                <Label className="text-lg">Question Variations (15 total)</Label>
                <div className="mt-2 space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => {
                    const key = `q${num}_variation_id` as keyof VariationSet;
                    const variationId = viewingSet[key] as number;
                    const variation = availableVariations.find(v => v.id === variationId);

                    return (
                      <div key={num} className="flex flex-col gap-1 p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Q{num}</Badge>
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            ID: {variationId}
                          </Badge>
                          <span className="text-sm font-medium">
                            {variation?.variation_name || 'Unknown Variation'}
                          </span>
                        </div>
                        {variation && (
                          <div className="ml-14 space-y-1">
                            <p className="text-xs text-gray-600">{variation.text_en}</p>
                            {variation.text_ar && (
                              <p className="text-xs text-gray-500" dir="rtl">{variation.text_ar}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate form component
function VariationSetForm({
  formData,
  setFormData,
  availableVariations,
  getVariationsForQuestion,
  onSubmit,
  onCancel,
  isEditing = false
}: {
  formData: VariationSetFormData;
  setFormData: React.Dispatch<React.SetStateAction<VariationSetFormData>>;
  availableVariations: QuestionVariation[];
  getVariationsForQuestion: (questionNumber: number) => QuestionVariation[];
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label>Set Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., UAE Citizens - Banking Industry"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this variation set..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Set Type *</Label>
            <Select
              value={formData.set_type}
              onValueChange={(value: any) => setFormData({ ...formData, set_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={formData.is_template}
              onCheckedChange={(checked) => setFormData({ ...formData, is_template: checked })}
            />
            <Label>Is Template</Label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Active</Label>
          </div>
        </div>
      </div>

      {/* Question Variations */}
      <div>
        <Label className="text-lg">Question Variations (Select 15) *</Label>
        <p className="text-sm text-gray-500 mb-4">
          Select one variation for each of the 15 Financial Clinic questions
        </p>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => {
            const variations = getVariationsForQuestion(num);
            const key = `q${num}_variation_id` as keyof VariationSetFormData;
            const selectedVariation = availableVariations.find(v => v.id === Number(formData[key]));

            return (
              <div key={num} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <Badge variant="outline" className="text-xs">Q{num}</Badge>
                </div>
                <div className="col-span-11">
                  <Select
                    value={formData[key]?.toString() || ''}
                    onValueChange={(value) => setFormData({ ...formData, [key]: parseInt(value) })}
                  >
                    <SelectTrigger className="h-auto min-h-[40px]">
                      <SelectValue placeholder={`Select variation for Question ${num}...`}>
                        {selectedVariation && (
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium text-sm">{selectedVariation.variation_name}</span>
                            <span className="text-xs text-gray-500 line-clamp-1">
                              {selectedVariation.text_en}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-[600px]">
                      {variations.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No variations available for Question {num}
                        </SelectItem>
                      ) : (
                        variations.map((variation) => (
                          <SelectItem
                            key={variation.id}
                            value={variation.id?.toString() || 'unknown'}
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  ID: {variation.id}
                                </Badge>
                                {variation.variation_name}
                              </div>
                              <div className="text-xs text-gray-600 line-clamp-2">
                                {variation.text_en}
                              </div>
                              {variation.text_ar && (
                                <div className="text-xs text-gray-500 line-clamp-1" dir="rtl">
                                  {variation.text_ar}
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Update Set' : 'Create Set'}
        </Button>
      </div>
    </div>
  );
}

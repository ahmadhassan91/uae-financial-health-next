"use client";

// CompaniesDetails component - Updated: 2026-01-06 (Deployment trigger)

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Building,
  Search,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  Power,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";

interface Company {
  id: string;
  company_name: string;
  company_email: string;
  contact_person: string;
  phone_number?: string;
  additional_details?: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}

export function CompaniesDetails() {
  const [uploadedCompanies, setUploadedCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    company_name: '',
    company_email: '',
    contact_person: '',
    phone_number: '',
    additional_details: ''
  });
  
  // Companies module enabled/disabled state
  const [moduleEnabled, setModuleEnabled] = useState(true);
  const [moduleStatusLoading, setModuleStatusLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const pageSizeOptions = [20, 50, 100, 150, 200];
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load module status on mount
  useEffect(() => {
    loadModuleStatus();
  }, []);

  const loadModuleStatus = async () => {
    try {
      const status = await adminApi.getCompaniesModuleStatus();
      setModuleEnabled(status.enabled);
    } catch (error) {
      console.error('Error loading module status:', error);
      // Default to enabled if we can't fetch status
      setModuleEnabled(true);
    } finally {
      setModuleStatusLoading(false);
    }
  };

  const handleModuleToggle = async (enabled: boolean) => {
    try {
      const result = await adminApi.updateCompaniesModuleStatus(enabled);
      setModuleEnabled(result.enabled);
      toast.success(result.message);
    } catch (error) {
      console.error('Error updating module status:', error);
      toast.error('Failed to update module status');
    }
  };

  // Load all companies on component mount and when pagination changes
  useEffect(() => {
    loadAllCompanies();
  }, [currentPage, pageSize]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadAllCompanies();
    }
  }, [searchTerm]);

  const loadAllCompanies = async () => {
    try {
      setIsLoading(true);
      const skip = (currentPage - 1) * pageSize;
      const data = await adminApi.getUploadedCompanies({
        search: searchTerm || undefined,
        skip,
        limit: pageSize
      });
      setAllCompanies(data.companies);
      setTotalCompanies(data.total);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCompanies / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize, 10));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await adminApi.uploadCompaniesCSV(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedCompanies(result.companies);
      setUploadStatus('success');
      toast.success(`Successfully uploaded ${result.companies_uploaded} companies`);
      
      // Refresh the companies list
      await loadAllCompanies();
      
    } catch (error) {
      setUploadStatus('error');
      toast.error('Failed to upload CSV file');
      console.error('CSV upload error:', error);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company.id);
    setEditForm({
      company_name: company.company_name,
      company_email: company.company_email,
      contact_person: company.contact_person,
      phone_number: company.phone_number || '',
      additional_details: company.additional_details || ''
    });
  };

  const handleSaveEdit = async (companyId: string) => {
    try {
      await adminApi.updateCompany(companyId, editForm);
      
      setAllCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, ...editForm, updated_at: new Date().toISOString() }
          : company
      ));
      
      setEditingCompany(null);
      setEditForm({});
      toast.success('Company updated successfully');
    } catch (error) {
      toast.error('Failed to update company');
      console.error('Update error:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setEditForm({});
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}?`)) {
      return;
    }
    
    try {
      await adminApi.deleteCompany(companyId);
      
      setAllCompanies(prev => prev.filter(company => company.id !== companyId));
      toast.success('Company deleted successfully');
    } catch (error) {
      toast.error('Failed to delete company');
      console.error('Delete error:', error);
    }
  };

  const handleCreateCompany = async () => {
    if (!createForm.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      console.log('🔧 [DEBUG] Creating company with data:', createForm);
      
      const result = await adminApi.createCompany({
        company_name: createForm.company_name,
        company_email: createForm.company_email || undefined,
        contact_person: createForm.contact_person || undefined,
        phone_number: createForm.phone_number || undefined,
        additional_details: createForm.additional_details || undefined
      });
      
      console.log('🔧 [DEBUG] Company created successfully:', result);
      
      // Refresh the companies list from server
      await loadAllCompanies();
      
      setShowCreateForm(false);
      setCreateForm({
        company_name: '',
        company_email: '',
        contact_person: '',
        phone_number: '',
        additional_details: ''
      });
      toast.success(`Company "${createForm.company_name}" created successfully`);
    } catch (error) {
      console.error('🔧 [DEBUG] Error creating company:', error);
      toast.error('Failed to create company');
    }
  };

  const handleToggleStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateCompany(companyId, { is_active: !currentStatus });
      
      setAllCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, is_active: !currentStatus, updated_at: new Date().toISOString() }
          : company
      ));
      
      toast.success(`Company ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle company status');
      console.error('Toggle error:', error);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "company_name\n" +
      "Acme Corporation\n" +
      "Global Trading\n" +
      "UAE Enterprises\n" +
      "Technology Solutions\n" +
      "International Trading Company";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-companies.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadCompaniesCSV = async () => {
    try {
      toast.info('Preparing CSV download...');
      const response = await adminApi.downloadCompaniesCSV();
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `companies_export_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Companies exported successfully!');
    } catch (error) {
      console.error('Error downloading companies CSV:', error);
      toast.error('Failed to download companies CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Companies Module Toggle */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Power className="w-5 h-5" />
                Companies Module
              </CardTitle>
              <CardDescription className="mt-1">
                When disabled, the company selection dropdown will not appear in the customer profile form.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {moduleStatusLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <span className={`text-sm font-medium ${moduleEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {moduleEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch
                    checked={moduleEnabled}
                    onCheckedChange={handleModuleToggle}
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Companies CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing company information. Only the company name is required.
            Other fields (email, contact, phone, details) will be auto-generated if not provided.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={uploadStatus === 'uploading'}
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Select CSV File'}
                </Button>
              </div>
            </div>
          </div>

          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Processing CSV file...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {uploadStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully uploaded {uploadedCompanies.length} companies!
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to process CSV file. Please check the file format and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCompaniesCSV}
              className="flex items-center gap-2"
              disabled={totalCompanies === 0}
            >
              <Download className="w-4 h-4" />
              Download Companies ({totalCompanies})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Company Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Company
            </CardTitle>
            <CardDescription>
              Add a new company manually. Only the company name is required. 
              All other fields are optional and will remain empty if not provided.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name *</label>
                <Input
                  value={createForm.company_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Enter company name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  value={createForm.company_email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, company_email: e.target.value }))}
                  placeholder="Optional: company@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contact Person</label>
                <Input
                  value={createForm.contact_person}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Optional: Contact Person"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Optional: +971-XX-XXXXXXX"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Additional Details</label>
                <Input
                  value={createForm.additional_details}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, additional_details: e.target.value }))}
                  placeholder="Optional: Additional information about the company"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateCompany}>
                <Plus className="w-4 h-4 mr-1" />
                Create Company
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            All Companies ({totalCompanies})
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Company
            </Button>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading companies...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="border rounded-lg hover:bg-gray-50"
                  >
                    {editingCompany === company.id ? (
                      // Edit Mode
                      <div className="p-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Company Name</label>
                            <Input
                              value={editForm.company_name || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Email</label>
                            <Input
                              value={editForm.company_email || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, company_email: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Contact Person</label>
                            <Input
                              value={editForm.contact_person || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, contact_person: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Phone</label>
                            <Input
                              value={editForm.phone_number || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-gray-700">Additional Details</label>
                            <Input
                              value={editForm.additional_details || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, additional_details: e.target.value }))}
                              placeholder="Additional information about the company"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(company.id)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <div className="font-medium">{company.company_name}</div>
                          <div className="text-sm text-gray-600">{company.company_email}</div>
                          <div className="text-sm text-gray-600">{company.contact_person}</div>
                          {company.phone_number && (
                            <div className="text-sm text-gray-600">{company.phone_number}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            Created: {new Date(company.created_at).toLocaleDateString()}
                            {company.updated_at && (
                              <span> • Updated: {new Date(company.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={company.is_active !== false ? "default" : "secondary"}>
                            {company.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={company.is_active !== false}
                            onCheckedChange={() => handleToggleStatus(company.id, company.is_active !== false)}
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleEditCompany(company)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCompany(company.id, company.company_name)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              {allCompanies.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No companies found</p>
                  <p className="text-sm">Upload a CSV file to add companies</p>
                </div>
              )}
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalCompanies > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCompanies)} of {totalCompanies} companies
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Uploaded Companies Preview */}
      {uploadedCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Recently Uploaded ({uploadedCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {uploadedCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{company.company_name}</div>
                      <div className="text-sm text-gray-600">{company.company_email}</div>
                      <div className="text-sm text-gray-600">{company.contact_person}</div>
                    </div>
                    <Badge variant="secondary">Just Uploaded</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

      

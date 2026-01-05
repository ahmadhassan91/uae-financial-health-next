"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Building,
  Search,
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
}

export function CompaniesDetails() {
  const [uploadedCompanies, setUploadedCompanies] = useState<Company[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 10;
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

  // Load existing companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      // Try public endpoint first to test database connection
      const publicResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/companies-details/public-companies`);
      if (publicResponse.ok) {
        const publicCompanies = await publicResponse.json();
        console.log('🔧 [DEBUG] Public companies loaded:', publicCompanies);
        
        // Transform public API format to Company interface format
        const transformedCompanies = publicCompanies.map((company: any) => ({
          id: company.id.toString(),
          company_name: company.name,
          company_email: 'no-email@example.com', // Default values for public API
          contact_person: 'Not specified',
          phone_number: null,
          additional_details: null,
          uploaded_by: 1, // Default user ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true // Default to active
        }));
        
        console.log('🔧 [DEBUG] Transformed companies:', transformedCompanies);
        setUploadedCompanies(transformedCompanies);
        return;
      }
      
      // If public fails, try admin endpoint
      const result = await adminApi.getUploadedCompanies('');
      setUploadedCompanies(result.companies);
      setCurrentPage(1); // Reset to first page when loading new data
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const validateCSVDuplicates = async (file: File): Promise<{isValid: boolean, error?: string, duplicates?: string[], existingCompanies?: string[]}> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            resolve({ isValid: false, error: 'CSV file is empty or only contains headers' });
            return;
          }
          
          // Get existing companies from database
          const existingCompanyNames = uploadedCompanies.map(c => c.company_name.toLowerCase());
          console.log('🔧 [DEBUG] Existing companies in DB:', existingCompanyNames);
          
          // Skip header and get company names from CSV
          const csvCompanyNames: string[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              // Handle CSV parsing - split by comma and get first non-empty column
              const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
              
              // Find the first non-empty column (company name)
              let companyName = '';
              for (const col of columns) {
                if (col && col.toLowerCase() !== 'company name') {
                  companyName = col;
                  break;
                }
              }
              
              if (companyName) {
                // Normalize: lowercase, trim whitespace, remove extra spaces
                const normalizedName = companyName.toLowerCase().replace(/\s+/g, ' ').trim();
                if (normalizedName) {
                  csvCompanyNames.push(normalizedName);
                }
              }
            }
          }
          
          console.log('🔧 [DEBUG] Parsed CSV companies:', csvCompanyNames);
          
          if (csvCompanyNames.length === 0) {
            resolve({ isValid: false, error: 'No valid company names found in CSV' });
            return;
          }
          
          // Check for duplicates within CSV
          const csvUniqueNames = new Set<string>();
          const csvDuplicates: string[] = [];
          
          for (const name of csvCompanyNames) {
            if (csvUniqueNames.has(name)) {
              csvDuplicates.push(name);
            } else {
              csvUniqueNames.add(name);
            }
          }
          
          // Check for companies that already exist in database
          const existingDuplicates: string[] = [];
          for (const csvName of csvCompanyNames) {
            if (existingCompanyNames.includes(csvName)) {
              existingDuplicates.push(csvName);
            }
          }
          
          if (csvDuplicates.length > 0) {
            // CSV has internal duplicates
            const formattedDuplicates = [...new Set(csvDuplicates)].map(name => 
              name.charAt(0).toUpperCase() + name.slice(1)
            );
            
            console.log('🔧 [DEBUG] CSV internal duplicates found:', formattedDuplicates);
            
            resolve({ 
              isValid: true, 
              duplicates: formattedDuplicates
            });
          } else if (existingDuplicates.length > 0) {
            // CSV companies already exist in database
            const formattedExisting = [...new Set(existingDuplicates)].map(name => 
              name.charAt(0).toUpperCase() + name.slice(1)
            );
            
            console.log('🔧 [DEBUG] Companies already exist in DB:', formattedExisting);
            
            resolve({ 
              isValid: true, 
              existingCompanies: formattedExisting
            });
          } else {
            console.log('🔧 [DEBUG] No conflicts found');
            resolve({ isValid: true });
          }
          
        } catch (error) {
          console.error('🔧 [DEBUG] CSV parsing error:', error);
          resolve({ isValid: false, error: 'Failed to parse CSV file' });
        }
      };
      
      reader.onerror = () => {
        resolve({ isValid: false, error: 'Failed to read CSV file' });
      };
      
      reader.readAsText(file);
    });
  };

  // Get unique companies for display
  const getUniqueCompanies = () => {
    console.log('🔧 [DEBUG] getUniqueCompanies called with uploadedCompanies:', uploadedCompanies);
    
    const uniqueCompanies = new Map();
    uploadedCompanies.forEach(company => {
      if (!uniqueCompanies.has(company.company_name)) {
        uniqueCompanies.set(company.company_name, company);
      }
    });
    
    const result = Array.from(uniqueCompanies.values());
    console.log('🔧 [DEBUG] Unique companies result:', result);
    
    return result;
  };

  // Get current page companies
  const getCurrentPageCompanies = () => {
    const companies = getUniqueCompanies();
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = startIndex + companiesPerPage;
    return companies.slice(startIndex, endIndex);
  };

  // Get pagination info
  const getPaginationInfo = () => {
    const companies = getUniqueCompanies();
    const totalPages = Math.ceil(companies.length / companiesPerPage);
    return {
      currentPage,
      totalPages,
      totalItems: companies.length,
      startIndex: (currentPage - 1) * companiesPerPage + 1,
      endIndex: Math.min(currentPage * companiesPerPage, companies.length)
    };
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
      // First, validate CSV for duplicates and existing companies
      console.log('🔧 [DEBUG] Validating CSV for duplicates and existing companies...');
      const csvValidation = await validateCSVDuplicates(file);
      console.log('🔧 [DEBUG] CSV validation result:', csvValidation);
      
      if (!csvValidation.isValid) {
        console.log('🔧 [DEBUG] CSV validation failed:', csvValidation.error);
        toast.error(csvValidation.error);
        setUploadStatus('error');
        return;
      }

      // Check if CSV companies already exist in database
      if (csvValidation.existingCompanies && csvValidation.existingCompanies.length > 0) {
        console.log('🔧 [DEBUG] Companies already exist in database:', csvValidation.existingCompanies);
        
        // Show modal with options
        const existingList = csvValidation.existingCompanies.join(', ');
        const shouldProceed = window.confirm(
          `The following companies already exist in the database:\n\n${existingList}\n\n` +
          `Choose an option:\n` +
          `• OK: Upload only unique companies (duplicates will be skipped)\n` +
          `• Cancel: Upload a different CSV file\n\n` +
          `Click OK to proceed with unique companies only, or Cancel to choose a different file.`
        );
        
        if (!shouldProceed) {
          setUploadStatus('error');
          return;
        }
        
        // Proceed with upload - backend will handle filtering
        console.log('🔧 [DEBUG] Proceeding with upload (unique companies only)');
      }

      // Check for internal CSV duplicates
      if (csvValidation.duplicates && csvValidation.duplicates.length > 0) {
        console.log('🔧 [DEBUG] Internal CSV duplicates found:', csvValidation.duplicates);
        const duplicateList = csvValidation.duplicates.join(', ');
        
        // Create a detailed error message
        const errorMessage = csvValidation.duplicates.length === 1
          ? `Duplicate company found in CSV: "${csvValidation.duplicates[0]}". Please remove duplicates and try again.`
          : `${csvValidation.duplicates.length} duplicate companies found in CSV:\n\n${csvValidation.duplicates.map(name => `• ${name}`).join('\n')}\n\nPlease remove duplicates and try again.`;
        
        // Show both alert and toast for better visibility
        alert(errorMessage);
        toast.error(`${csvValidation.duplicates.length} duplicate companies found in CSV. Check console for details.`);
        
        setUploadStatus('error');
        return;
      }

      console.log('🔧 [DEBUG] CSV validation passed, proceeding with upload...');

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
      await loadCompanies();
      
    } catch (error) {
      setUploadStatus('error');
      toast.error('Failed to upload CSV file');
      console.error('CSV upload error:', error);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "# Company Names - Ensure all names are unique\n" +
      "Company Name\n" +
      "Acme Corporation\n" +
      "Global Trading\n" +
      "UAE Enterprises";
    
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

  const handleToggleCompany = async (companyId: number, currentStatus: boolean) => {
    console.log('🔧 [DEBUG] handleToggleCompany called:', companyId, currentStatus);
    
    try {
      console.log('🔧 [DEBUG] Calling toggleCompanyStatus API for:', companyId);
      const response = await adminApi.toggleCompanyStatus(companyId);
      console.log('🔧 [DEBUG] Toggle API response:', response);
      
      if (response.message) {
        toast.success(response.message);
        console.log('🔧 [DEBUG] Toggle successful, refreshing companies list');
        // Refresh the companies list
        loadCompanies();
      }
    } catch (error) {
      console.error('🔧 [DEBUG] Error toggling company status:', error);
      toast.error('Failed to update company status');
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    console.log('🔧 [DEBUG] handleDeleteCompany called:', companyId);
    
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      console.log('🔧 [DEBUG] User cancelled individual deletion');
      return;
    }

    try {
      console.log('🔧 [DEBUG] Calling deleteCompany API for:', companyId);
      const response = await adminApi.deleteCompany(companyId);
      console.log('🔧 [DEBUG] Delete API response:', response);
      
      if (response.message) {
        toast.success(response.message);
        console.log('🔧 [DEBUG] Delete successful, refreshing companies list');
        // Refresh the companies list
        loadCompanies();
      }
    } catch (error) {
      console.error('🔧 [DEBUG] Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  // Selection handlers
  const handleSelectCompany = (companyId: string) => {
    const newSelection = new Set(selectedCompanies);
    if (newSelection.has(companyId)) {
      newSelection.delete(companyId);
    } else {
      newSelection.add(companyId);
    }
    setSelectedCompanies(newSelection);
  };

  const handleSelectAll = () => {
    const currentPageCompanies = getCurrentPageCompanies();
    const currentPageIds = currentPageCompanies.map(company => company.id);
    
    if (currentPageIds.every(id => selectedCompanies.has(id))) {
      // Deselect all on current page
      const newSelection = new Set(selectedCompanies);
      currentPageIds.forEach(id => newSelection.delete(id));
      setSelectedCompanies(newSelection);
    } else {
      // Select all on current page
      const newSelection = new Set(selectedCompanies);
      currentPageIds.forEach(id => newSelection.add(id));
      setSelectedCompanies(newSelection);
    }
  };

  const handleBulkToggle = async (enable: boolean) => {
    console.log('🔧 [DEBUG] handleBulkToggle called with enable:', enable);
    console.log('🔧 [DEBUG] selectedCompanies:', selectedCompanies);
    
    if (selectedCompanies.size === 0) {
      toast.error('Please select at least one company');
      return;
    }

    const action = enable ? 'enable' : 'disable';
    console.log('🔧 [DEBUG] Action:', action, 'for', selectedCompanies.size, 'companies');
    
    if (!confirm(`Are you sure you want to ${action} ${selectedCompanies.size} selected companies?`)) {
      console.log('🔧 [DEBUG] User cancelled bulk toggle');
      return;
    }

    try {
      console.log('🔧 [DEBUG] Starting bulk toggle operations...');
      let successCount = 0;
      for (const companyId of selectedCompanies) {
        console.log('🔧 [DEBUG] Toggling company:', companyId);
        try {
          const response = await adminApi.toggleCompanyStatus(parseInt(companyId));
          console.log('🔧 [DEBUG] Successfully toggled company:', companyId, 'Response:', response);
          successCount++;
        } catch (error) {
          console.error('🔧 [DEBUG] Failed to toggle company:', companyId, 'Error:', error);
          // Continue with other companies even if one fails
        }
      }
      
      console.log('🔧 [DEBUG] Bulk toggle completed. Success count:', successCount);
      toast.success(`Successfully ${action}d ${successCount} companies`);
      setSelectedCompanies(new Set()); // Clear selection
      loadCompanies(); // Refresh list
    } catch (error) {
      console.error('🔧 [DEBUG] Error bulk toggling companies:', error);
      toast.error(`Failed to ${action} some companies`);
    }
  };

  const handleBulkDelete = async () => {
    console.log('🔧 [DEBUG] handleBulkDelete called');
    console.log('🔧 [DEBUG] selectedCompanies:', selectedCompanies);
    
    if (selectedCompanies.size === 0) {
      toast.error('Please select at least one company');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCompanies.size} selected companies? This action cannot be undone.`)) {
      console.log('🔧 [DEBUG] User cancelled bulk delete');
      return;
    }

    try {
      console.log('🔧 [DEBUG] Starting bulk delete operations...');
      let successCount = 0;
      for (const companyId of selectedCompanies) {
        console.log('🔧 [DEBUG] Deleting company:', companyId);
        await adminApi.deleteCompany(parseInt(companyId));
        successCount++;
        console.log('🔧 [DEBUG] Successfully deleted company:', companyId);
      }
      
      console.log('🔧 [DEBUG] Bulk delete completed. Success count:', successCount);
      toast.success(`Successfully deleted ${successCount} companies`);
      setSelectedCompanies(new Set()); // Clear selection
      loadCompanies(); // Refresh list
    } catch (error) {
      console.error('🔧 [DEBUG] Error bulk deleting companies:', error);
      toast.error('Failed to delete some companies');
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Companies CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing company information. The CSV should have column: 
            Company Name (required). Other columns like Email, Contact, Phone, Details are optional.
            <br /><br />
            <strong>⚠️ Note:</strong> CSV files with duplicate company names will be rejected. 
            Please ensure all company names are unique before uploading.
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
          </div>
        </CardContent>
      </Card>

     

      {/* Uploaded Companies Table - Only show if companies exist */}
      {uploadedCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Unique Companies ({getUniqueCompanies().length})
            </CardTitle>
            <CardDescription>
              View and manage unique uploaded companies (duplicates automatically removed)
            </CardDescription>
            
            {/* Bulk Action Buttons */}
            {selectedCompanies.size > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-800">
                  {selectedCompanies.size} company{selectedCompanies.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔧 [DEBUG] Enable Selected button clicked!');
                    handleBulkToggle(true);
                  }}
                  className="text-xs"
                >
                  Enable Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔧 [DEBUG] Disable Selected button clicked!');
                    handleBulkToggle(false);
                  }}
                  className="text-xs"
                >
                  Disable Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    console.log('🔧 [DEBUG] Delete Selected button clicked!');
                    handleBulkDelete();
                  }}
                  className="text-xs"
                >
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCompanies(new Set())}
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={getCurrentPageCompanies().every(company => selectedCompanies.has(company.id))}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left p-3 font-medium">Company Name</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageCompanies().map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedCompanies.has(company.id)}
                            onChange={() => handleSelectCompany(company.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-3 font-medium">
                          {company.company_name}
                        </td>
                        <td className="p-3">
                          <Badge variant={company.is_active ? "default" : "secondary"}>
                            {company.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCompany(company.id, company.is_active)}
                              className="text-xs"
                            >
                              {company.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCompany(company.id)}
                              className="text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {getPaginationInfo().totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {getPaginationInfo().startIndex} to {getPaginationInfo().endIndex} of {getPaginationInfo().totalItems} companies
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {getPaginationInfo().totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(getPaginationInfo().totalPages, prev + 1))}
                      disabled={currentPage === getPaginationInfo().totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

      

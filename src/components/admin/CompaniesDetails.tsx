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

  // Load existing companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      // Try public endpoint first to test database connection
      const publicResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/companies-details/public-companies`);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        console.log('Public companies loaded:', publicData);
        // Convert to expected format
        setUploadedCompanies(publicData.map((item: any) => ({
          id: item.id,
          company_name: item.name,
          company_email: '',
          contact_person: '',
          phone_number: '',
          additional_details: ''
        })));
        setCurrentPage(1); // Reset to first page when loading new data
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

  // Get unique companies for display
  const getUniqueCompanies = () => {
    const uniqueCompanies = new Map();
    uploadedCompanies.forEach(company => {
      if (!uniqueCompanies.has(company.company_name)) {
        uniqueCompanies.set(company.company_name, company);
      }
    });
    return Array.from(uniqueCompanies.values());
  };

  // Get current page companies
  const getCurrentPageCompanies = () => {
    const uniqueCompanies = getUniqueCompanies();
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = startIndex + companiesPerPage;
    return uniqueCompanies.slice(startIndex, endIndex);
  };

  // Get pagination info
  const getPaginationInfo = () => {
    const uniqueCompanies = getUniqueCompanies();
    const totalPages = Math.ceil(uniqueCompanies.length / companiesPerPage);
    return {
      currentPage,
      totalPages,
      totalItems: uniqueCompanies.length,
      startIndex: (currentPage - 1) * companiesPerPage + 1,
      endIndex: Math.min(currentPage * companiesPerPage, uniqueCompanies.length)
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
    const csvContent = "Company Name\n" +
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

     

      {/* Uploaded Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Uploaded Companies ({getUniqueCompanies().length})
          </CardTitle>
          <CardDescription>
            View and manage all uploaded companies (duplicates removed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedCompanies.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Company Name</th>
                    
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageCompanies().map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{company.company_name}</td>
                        <td className="p-3">
                          <Badge variant="secondary">Uploaded</Badge>
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No companies uploaded yet. Upload a CSV file to get started.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

      

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Users, 
  BarChart3, 
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import CompanyAdminDashboard from '@/components/admin/CompanyAdminDashboard';
import { adminApi } from '@/lib/admin-api';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface Company {
  id: number;
  company_name: string;
  company_email: string;
  contact_person: string;
  phone_number?: string;
  additional_details?: string;
  uploaded_by: number;
  created_at: string;
  updated_at?: string;
}

export default function CompanyAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated && user) {
      loadCompanies();
    }
  }, [loading, isAuthenticated, user]);

  const loadCompanies = async () => {
    try {
      const data = await adminApi.getUploadedCompanies(searchTerm);
      setCompanies(data.companies);
      setError(null);
    } catch (error) {
      setError('Failed to load companies');
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access company administration.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (selectedCompany) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCompany(null)}
            className="mb-4"
          >
            ← Back to Companies
          </Button>
        </div>
        <CompanyAdminDashboard companyId={selectedCompany.id} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Company Administration</h1>
          <p className="text-muted-foreground">
            Manage company question sets and view analytics
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Company</CardTitle>
            <CardDescription>
              Search for a company to manage its question sets and view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, contact person, or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading companies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCompany(company)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{company.company_name}</CardTitle>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <CardDescription>
                    {company.contact_person}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-mono text-xs">{company.company_email}</span>
                    </div>
                    {company.phone_number && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-mono text-xs">{company.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-xs">{new Date(company.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        ID: {company.id}
                      </span>
                      <Button size="sm" variant="ghost">
                        Manage
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCompanies.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No companies found matching your search.' : 'No companies available.'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {companies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{companies.length}</p>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {companies.filter(c => c.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Companies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {companies.reduce((sum, c) => sum + c.total_assessments, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {companies.filter(c => c.average_score).length > 0 ? 
                      (companies
                        .filter(c => c.average_score)
                        .reduce((sum, c) => sum + c.average_score, 0) / 
                       companies.filter(c => c.average_score).length
                      ).toFixed(1) : 
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
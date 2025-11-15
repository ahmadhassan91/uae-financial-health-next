'use client';

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

interface Company {
  id: number;
  company_name: string;
  company_email: string;
  contact_person: string;
  unique_url: string;
  total_assessments: number;
  average_score: number;
  is_active: boolean;
  created_at: string;
}

export default function CompanyAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUserRole();
    loadCompanies();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode token to check user role (simplified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role || 'user');
      
      if (payload.role !== 'admin' && payload.role !== 'company_admin') {
        setError('Access denied. Company admin privileges required.');
        return;
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load companies');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.unique_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredCompanies.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCompany(company)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{company.company_name}</CardTitle>
                    <Badge variant={company.is_active ? "default" : "secondary"}>
                      {company.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        'Inactive'
                      )}
                    </Badge>
                  </div>
                  <CardDescription>
                    {company.contact_person}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="font-mono text-xs">{company.unique_url}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{company.total_assessments} assessments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {company.average_score ? 
                            `${company.average_score.toFixed(1)} avg` : 
                            'No data'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(company.created_at).toLocaleDateString()}
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
/**
 * Company management hook for admin users
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { toast } from 'sonner';

interface Company {
  id: number;
  company_name: string;
  company_email: string;
  contact_person: string;
  phone_number?: string;
  unique_url: string;
  is_active: boolean;
  total_assessments: number;
  average_score?: number;
  question_variation_mapping?: Record<string, number>;
  created_at: string;
  updated_at?: string;
}

interface CompanyLink {
  company_id: number;
  url: string;
  expires_at?: string;
  max_responses?: number;
}

export function useCompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companiesData = await apiClient.getCompanies();
      setCompanies(companiesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load companies';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = async (companyData: {
    company_name: string;
    company_email: string;
    contact_person: string;
    phone_number?: string;
    question_variation_mapping?: Record<string, number>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCompany = await apiClient.createCompany(companyData);
      setCompanies(prev => [newCompany, ...prev]);
      toast.success(`Company "${companyData.company_name}" created successfully`);
      
      return newCompany;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId: number, updates: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await apiClient.updateCompany(companyId, updates);
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? updatedCompany : company
      ));
      toast.success('Company updated successfully');
      
      return updatedCompany;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (companyId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.deleteCompany(companyId);
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      toast.success('Company deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (companyId: number, config?: {
    prefix?: string;
    expiry_days?: number;
    max_responses?: number;
    custom_branding?: boolean;
  }): Promise<CompanyLink> => {
    try {
      setError(null);
      
      const link = await apiClient.generateCompanyLink(companyId, config);
      toast.success('Company link generated successfully');
      
      return link;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate link';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const getAnalytics = async (companyId: number) => {
    try {
      setError(null);
      
      const analytics = await apiClient.getCompanyAnalytics(companyId);
      return analytics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return {
    companies,
    loading,
    error,
    loadCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    generateLink,
    getAnalytics
  };
}

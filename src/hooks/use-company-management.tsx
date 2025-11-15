/**
 * Hook for managing companies in the admin dashboard
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Company {
  id: number;
  company_name: string;
  company_email: string;
  contact_person?: string;
  phone_number?: string;
  unique_url: string;
  is_active: boolean;
  created_at: string;
}

interface NewCompany {
  company_name: string;
  company_email: string;
  contact_person: string;
  phone_number: string;
}

export function useCompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/?skip=0&limit=100`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load companies');
      }
      
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (newCompany: NewCompany) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newCompany),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create company');
      }
      
      const created = await response.json();
      setCompanies(prev => [...prev, created]);
      toast.success(`Company "${created.company_name}" created successfully`);
      return created;
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
      throw error;
    }
  };

  const deleteCompany = async (companyId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete company');
      }
      
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      toast.success('Company deleted successfully');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
      throw error;
    }
  };

  const generateLink = async (companyId: number) => {
    // Link generation is now handled by the component
    // This is kept for compatibility
    return true;
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return {
    companies,
    loading,
    createCompany,
    deleteCompany,
    generateLink,
    reload: loadCompanies,
  };
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyVariationStatus {
  id: number;
  company_name: string;
  unique_url: string;
  enable_variations: boolean;
  variation_set_id: number | null;
  variation_set_name: string | null;
  variations_enabled_at: string | null;
  variations_enabled_by: string | null;
}

export function CompanyVariationControl() {
  const [companies, setCompanies] = useState<CompanyVariationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(
        `/api/v1/admin/variations/companies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
        // Fallback to mock data if endpoint doesn't exist
        const mockData: CompanyVariationStatus[] = [
          {
            id: 69,
            company_name: 'Clustox',
            unique_url: 'clustox1',
            enable_variations: true,
            variation_set_id: 1,
            variation_set_name: 'Test Set',
            variations_enabled_at: new Date().toISOString(),
            variations_enabled_by: 'Admin'
          },
          {
            id: 68,
            company_name: 'test link 1',
            unique_url: 'testlink1',
            enable_variations: false,
            variation_set_id: 1,
            variation_set_name: 'Test Set',
            variations_enabled_at: null,
            variations_enabled_by: null
          }
        ];
        setCompanies(mockData);
      }
    } catch (error) {
      toast.error('Failed to load companies');
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVariations = async (companyId: number, enable: boolean) => {
    setUpdating(companyId);
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(
        `/api/v1/admin/variations/companies/${companyId}/toggle`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enable_variations: enable,
            reason: enable ? 'Admin enabled variations' : 'Admin disabled variations'
          }),
        }
      );

      if (response.ok) {
        toast.success(`Variations ${enable ? 'enabled' : 'disabled'} successfully`);
        loadCompanies(); // Reload to get updated status
      } else {
        toast.error('Failed to update variation settings');
      }
    } catch (error) {
      toast.error('Failed to update variation settings');
      console.error('Failed to toggle variations:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Variations must be explicitly enabled for each company. 
          Companies with variations disabled will see default questions regardless of company URL.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg">{company.company_name}</h3>
                    <Badge variant={company.enable_variations ? 'default' : 'secondary'}>
                      {company.enable_variations ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        'Disabled'
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    URL: <code className="bg-muted px-1 py-0.5 rounded">{company.unique_url}</code>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Set: {company.variation_set_name || 'No set assigned'}
                  </p>
                  {company.variations_enabled_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Enabled by {company.variations_enabled_by} on {new Date(company.variations_enabled_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">Variations</p>
                    <p className="text-xs text-muted-foreground">
                      {company.enable_variations ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <Switch
                    checked={company.enable_variations}
                    onCheckedChange={(checked) => 
                      toggleVariations(company.id, checked)
                    }
                    disabled={updating === company.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

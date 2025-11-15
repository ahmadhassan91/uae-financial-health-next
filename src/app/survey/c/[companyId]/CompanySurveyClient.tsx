'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSurvey } from '@/hooks/use-survey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CompanySurveyClientProps {
  companyId: string;
}

function CompanySurveyContent({ companyId }: CompanySurveyClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, updateProfile } = useSurvey();
  const [companyInfo, setCompanyInfo] = useState<{
    name: string;
    id: string;
    isActive: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const referralSource = searchParams.get('ref') || 'direct';
  const campaign = searchParams.get('campaign');
  const location = searchParams.get('location');

  useEffect(() => {
    // Validate and fetch company information
    const validateCompany = async () => {
      try {
        setLoading(true);
        
        // For now, simulate company validation
        // In production, this would call the backend API
        const mockCompanyData = {
          emiratesnbd: { name: 'Emirates NBD', isActive: true },
          adcb: { name: 'Abu Dhabi Commercial Bank', isActive: true },
          mashreq: { name: 'Mashreq Bank', isActive: true },
          etisalat: { name: 'Etisalat', isActive: true },
          dnata: { name: 'dnata', isActive: true }
        };

        const company = mockCompanyData[companyId as keyof typeof mockCompanyData];
        
        if (!company) {
          toast.error('Invalid company link. Please check the URL.');
          router.push('/');
          return;
        }

        if (!company.isActive) {
          toast.error('This company survey link has expired or is no longer active.');
          router.push('/');
          return;
        }

        setCompanyInfo({
          name: company.name,
          id: companyId,
          isActive: company.isActive
        });

        // Track the company access
        console.log('Company survey accessed:', {
          companyId,
          referralSource,
          campaign,
          location,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error validating company:', error);
        toast.error('Error accessing company survey');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      validateCompany();
    }
  }, [companyId, referralSource, campaign, location, router]);

  const handleSurveyStart = () => {
    // If no profile exists, redirect to profile creation with company context
    if (!profile) {
      // Store company context in localStorage for after profile creation
      localStorage.setItem('company-context', JSON.stringify({
        companyId,
        companyName: companyInfo?.name,
        referralSource,
        campaign,
        location
      }));
      
      router.push('/profile');
      toast.info(`Please complete your profile to start the ${companyInfo?.name} financial health assessment.`);
    } else {
      // Profile exists, start survey directly
      router.push('/survey');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Loading Company Survey</CardTitle>
            <CardDescription>Validating access...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!companyInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This company survey link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="text-2xl">{companyInfo.name}</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Employee Financial Health Assessment
              </CardDescription>
              
              {/* Tracking Info */}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Corporate Wellness Initiative</span>
                </div>
                {referralSource !== 'direct' && (
                  <div className="text-xs bg-secondary px-2 py-1 rounded">
                    via {referralSource}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Take part in your company's financial wellness program. This confidential assessment 
                  will help you understand your financial health and receive personalized recommendations.
                </p>
                
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What you'll get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Personalized financial health score</li>
                    <li>• UAE-specific financial advice</li>
                    <li>• Anonymous participation (company sees only aggregated data)</li>
                    <li>• Actionable recommendations for improvement</li>
                  </ul>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleSurveyStart} size="lg" className="min-w-[160px]">
                    Start Assessment
                  </Button>
                  <Button onClick={handleGoBack} variant="outline" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Exit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Notice */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <h4 className="font-semibold text-foreground">Privacy & Confidentiality</h4>
              <p>
                Your individual responses are completely confidential. {companyInfo.name} will only 
                receive aggregated, anonymous insights to support workplace financial wellness programs.
              </p>
              <p>
                This assessment is provided by National Bonds Corporation in partnership with your employer 
                to promote financial literacy and wellness in the UAE.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CompanySurveyClient({ companyId }: CompanySurveyClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Loading Company Survey</CardTitle>
            <CardDescription>Initializing...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <CompanySurveyContent companyId={companyId} />
    </Suspense>
  );
}
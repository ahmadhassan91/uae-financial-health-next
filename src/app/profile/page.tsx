'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerProfileForm } from '@/components/CustomerProfileForm';
import { useSurvey } from '@/hooks/use-survey';
import { toast } from 'sonner';
import { CustomerProfile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, saveProfile } = useSurvey();
  const [companyContext, setCompanyContext] = useState<{
    companyId: string;
    companyName: string;
    referralSource: string;
    campaign?: string;
    location?: string;
  } | null>(null);

  useEffect(() => {
    // Check if user came from a company link
    const storedContext = localStorage.getItem('company-context');
    if (storedContext) {
      setCompanyContext(JSON.parse(storedContext));
    }
  }, []);

  const handleProfileCompleted = async (completedProfile: CustomerProfile) => {
    await saveProfile(completedProfile);
    
    if (companyContext) {
      // Clear company context and redirect back to survey
      localStorage.removeItem('company-context');
      router.push('/survey');
      toast.success(`Profile saved. Starting ${companyContext.companyName} financial health assessment...`);
    } else {
      // Regular flow
      router.push('/survey');
      toast.success('Profile saved. Starting financial health assessment...');
    }
  };

  return (
    <div>
      {companyContext && (
        <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm text-primary">
                <strong>Company Assessment:</strong> {companyContext.companyName}
              </p>
              <p className="text-xs text-muted-foreground">
                Complete your profile to start the corporate financial wellness assessment
              </p>
            </div>
          </div>
        </div>
      )}
      
      <CustomerProfileForm
        existingProfile={profile}
        onComplete={handleProfileCompleted}
      />
    </div>
  );
}

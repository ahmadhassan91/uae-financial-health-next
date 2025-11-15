'use client';

import { useRouter } from 'next/navigation';
import { ConsentModal } from '@/components/ConsentModal';
import { toast } from 'sonner';

export default function ConsentPage() {
  const router = useRouter();

  const handleConsentGranted = () => {
    router.push('/profile');
    toast.success('Consent recorded. Please complete your profile to proceed.');
  };

  const handleConsentDeclined = () => {
    router.push('/');
    toast.error('Consent is required to use this service.');
  };

  return (
    <ConsentModal 
      onConsent={handleConsentGranted}
      onDecline={handleConsentDeclined}
    />
  );
}

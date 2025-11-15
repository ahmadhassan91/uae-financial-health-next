'use client';

import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { SimpleAuthForm } from '@/components/SimpleAuthForm';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useSimpleAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <SimpleAuthForm onSuccess={handleSuccess} onBack={handleBack} />;
}

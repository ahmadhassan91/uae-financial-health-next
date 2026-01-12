'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreHistory } from '@/components/ScoreHistory';
import { SimpleAuthForm } from '@/components/SimpleAuthForm';
import { useSimpleAuth } from '@/hooks/use-simple-auth';

function HistoryContent() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useSimpleAuth();
  const [showAuthForm, setShowAuthForm] = useState(!isAuthenticated);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleAuthSuccess = () => {
    setShowAuthForm(false);
  };

  const handleLogout = () => {
    logout();
    setShowAuthForm(true);
  };

  if (showAuthForm || !isAuthenticated) {
    return (
      <SimpleAuthForm
        onSuccess={handleAuthSuccess}
        onBack={handleBackToHome}
        title="Access Your Assessment History"
        description="Enter your email and date of birth to view your previous financial health assessments"
      />
    );
  }

  return (
    <ScoreHistory
      scoreHistory={user?.surveyHistory || []}
      onBack={handleBackToHome}
      onLogout={handleLogout}
      userEmail={user?.email}
    />
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}

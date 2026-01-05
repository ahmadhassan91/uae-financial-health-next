'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login since this page requires authentication
    router.push('/login');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>Redirecting to login...</p>
      </div>
    </div>
  );
}

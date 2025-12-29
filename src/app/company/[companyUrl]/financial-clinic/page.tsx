import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Company-specific Financial Clinic entry page
 * Accessed via: /company/{company_url}/financial-clinic
 * 
 * This page:
 * 1. Validates the company URL
 * 2. Displays company branding (if configured)
 * 3. Redirects to Financial Clinic with company tracking
 */

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return common company URLs that should be pre-generated
  // In production, this could fetch from an API or database
  return [
    { companyUrl: 'emiratesnbd' },
    { companyUrl: 'adcb' },
    { companyUrl: 'mashreq' },
    { companyUrl: 'etisalat' },
    { companyUrl: 'dnata' },
    { companyUrl: 'demo' },
  ];
}

import CompanyFinancialClinicClient from './CompanyFinancialClinicClient';

export default function CompanyFinancialClinicPage({ params }: { params: { companyUrl: string } }) {
  return <CompanyFinancialClinicClient companyUrl={params.companyUrl} />;
}

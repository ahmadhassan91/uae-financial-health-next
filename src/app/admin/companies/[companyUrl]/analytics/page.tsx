import CompanyAnalyticsClient from './CompanyAnalyticsClient';

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

export default function CompanyAnalyticsPage({ params }: { params: { companyUrl: string } }) {
  return <CompanyAnalyticsClient companyUrl={params.companyUrl} />;
}

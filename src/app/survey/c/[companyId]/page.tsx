import CompanySurveyClient from './CompanySurveyClient';

// Generate static params for known company IDs
export async function generateStaticParams() {
  // Return common company IDs that should be pre-generated
  // In production, this could fetch from an API or database
  return [
    { companyId: 'emiratesnbd' },
    { companyId: 'adcb' },
    { companyId: 'mashreq' },
    { companyId: 'etisalat' },
    { companyId: 'dnata' },
    { companyId: 'demo' },
  ];
}

export default function CompanySurveyPage({ params }: { params: { companyId: string } }) {
  return <CompanySurveyClient companyId={params.companyId} />;
}

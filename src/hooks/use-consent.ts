import { ConsentRecord } from '../lib/types';
import { useKV } from './use-kv-fallback';

export function useConsent() {
  const [consentRecords, setConsentRecords] = useKV<ConsentRecord[]>('consent-records', []);
  
  const grantConsent = (consentType: ConsentRecord['consentType']) => {
    const newRecord: ConsentRecord = {
      userId: 'user-1', // In real app, this would come from auth
      consentType,
      granted: true,
      timestamp: new Date(),
      ipAddress: 'unknown' // In real app, this would be captured
    };
    
    setConsentRecords((current) => [
      ...current.filter(r => r.consentType !== consentType),
      newRecord
    ]);
  };
  
  const revokeConsent = (consentType: ConsentRecord['consentType']) => {
    const newRecord: ConsentRecord = {
      userId: 'user-1',
      consentType,
      granted: false,
      timestamp: new Date(),
      ipAddress: 'unknown'
    };
    
    setConsentRecords((current) => [
      ...current.filter(r => r.consentType !== consentType),
      newRecord
    ]);
  };
  
  const hasConsent = (consentType: ConsentRecord['consentType']) => {
    const latestRecord = consentRecords
      .filter(r => r.consentType === consentType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return latestRecord?.granted || false;
  };
  
  return {
    grantConsent,
    revokeConsent,
    hasConsent,
    consentRecords
  };
}
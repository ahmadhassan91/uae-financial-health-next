'use client';

import React, { useState, useEffect } from 'react';
import { TokenManager } from '@/utils/token-manager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

interface TokenExpirationWarningProps {
  tokenKey?: string;
  warningThresholdMinutes?: number;
  onExtendSession?: () => void;
}

export function TokenExpirationWarning({ 
  tokenKey = 'admin_access_token',
  warningThresholdMinutes = 10,
  onExtendSession
}: TokenExpirationWarningProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const minutesLeft = TokenManager.getTimeUntilExpiry(tokenKey);
      setTimeLeft(minutesLeft);
      
      if (minutesLeft !== null && minutesLeft <= warningThresholdMinutes && minutesLeft > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiration();
    
    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [tokenKey, warningThresholdMinutes]);

  const handleExtendSession = () => {
    if (onExtendSession) {
      onExtendSession();
    } else {
      // Default behavior: refresh the page to potentially get a new token
      window.location.reload();
    }
  };

  if (!showWarning || timeLeft === null) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>
            Your session will expire in {timeLeft} minute{timeLeft !== 1 ? 's' : ''}. 
            Please save your work.
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExtendSession}
          className="ml-4"
        >
          Extend Session
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default TokenExpirationWarning;

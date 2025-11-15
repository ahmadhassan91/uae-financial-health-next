'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { tokenManager } from '@/lib/token-manager';

interface SessionWarningProps {
  isAdmin?: boolean;
  onExtendSession?: () => void;
  onLogout?: () => void;
}

export function SessionWarning({ isAdmin = false, onExtendSession, onLogout }: SessionWarningProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const minutesLeft = tokenManager.getTimeUntilExpiry(isAdmin);
      
      if (minutesLeft === null) {
        setShowWarning(false);
        return;
      }

      setTimeLeft(minutesLeft);
      
      // Show warning if less than 5 minutes left
      if (minutesLeft <= 5 && minutesLeft > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await tokenManager.refreshToken(isAdmin);
      
      if (success) {
        setShowWarning(false);
        onExtendSession?.();
      } else {
        // Refresh failed, will redirect to login
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    tokenManager.clearAll();
    onLogout?.();
    
    if (isAdmin) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/';
    }
  };

  if (!showWarning || timeLeft === null) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Clock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          ⚠️ Your session will expire in <strong>{timeLeft} minute{timeLeft !== 1 ? 's' : ''}</strong>
        </span>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleExtendSession}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Extend Session
              </>
            )}
          </Button>
          
          <Button
            onClick={handleLogout}
            size="sm"
            variant="ghost"
            className="text-xs text-red-600 hover:text-red-700"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Token Management Utilities
 * Handles token expiration checking and automatic refresh
 */

interface TokenInfo {
  token: string;
  expiresAt: number; // Unix timestamp
  isAdmin: boolean;
}

export class TokenManager {
  private static readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  private static refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Decode JWT token and extract expiration time
   */
  static decodeToken(token: string): { exp: number; sub: string; email: string; is_admin?: boolean } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired or about to expire
   */
  static isTokenExpired(token: string, bufferMs: number = 0): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime >= (expirationTime - bufferMs);
  }

  /**
   * Get token info including expiration
   */
  static getTokenInfo(tokenKey: string = 'admin_access_token'): TokenInfo | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      token,
      expiresAt: decoded.exp * 1000,
      isAdmin: decoded.is_admin || false
    };
  }

  /**
   * Start monitoring token expiration and schedule refresh/logout
   */
  static startTokenMonitoring(onTokenExpired?: () => void): void {
    if (typeof window === 'undefined') return;

    // Clear any existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const checkToken = () => {
      const adminToken = this.getTokenInfo('admin_access_token');
      const userToken = this.getTokenInfo('auth_token');
      
      const tokenToCheck = adminToken || userToken;
      
      if (!tokenToCheck) {
        // No token found, stop monitoring
        return;
      }

      const timeUntilExpiry = tokenToCheck.expiresAt - Date.now();
      
      if (timeUntilExpiry <= 0) {
        // Token has expired
        console.log('Token has expired, clearing auth');
        this.clearAllTokens();
        
        if (onTokenExpired) {
          onTokenExpired();
        } else {
          this.redirectToLogin(tokenToCheck.isAdmin);
        }
        return;
      }

      if (timeUntilExpiry <= this.TOKEN_REFRESH_BUFFER) {
        // Token is about to expire, try to refresh or logout
        console.log('Token is about to expire, attempting refresh or logout');
        this.handleTokenNearExpiry(tokenToCheck.isAdmin, onTokenExpired);
        return;
      }

      // Schedule next check
      const nextCheckTime = Math.min(timeUntilExpiry - this.TOKEN_REFRESH_BUFFER, 60000); // Check every minute max
      this.refreshTimeout = setTimeout(checkToken, nextCheckTime);
    };

    checkToken();
  }

  /**
   * Handle token near expiry - attempt refresh or logout
   */
  private static handleTokenNearExpiry(isAdmin: boolean, onTokenExpired?: () => void): void {
    // For now, we'll just logout when token is near expiry
    // In the future, this could attempt to refresh the token
    console.log('Token is near expiry, logging out');
    
    this.clearAllTokens();
    
    if (onTokenExpired) {
      onTokenExpired();
    } else {
      this.redirectToLogin(isAdmin);
    }
  }

  /**
   * Clear all authentication tokens
   */
  static clearAllTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Clear monitoring timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Redirect to appropriate login page
   */
  private static redirectToLogin(isAdmin: boolean): void {
    if (typeof window === 'undefined') return;
    
    if (isAdmin) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/';
    }
  }

  /**
   * Stop token monitoring
   */
  static stopTokenMonitoring(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Get time until token expires in minutes
   */
  static getTimeUntilExpiry(tokenKey: string = 'admin_access_token'): number | null {
    const tokenInfo = this.getTokenInfo(tokenKey);
    if (!tokenInfo) return null;
    
    const timeLeft = tokenInfo.expiresAt - Date.now();
    return Math.max(0, Math.floor(timeLeft / 60000)); // Convert to minutes
  }

  /**
   * Check if user should be warned about token expiration
   */
  static shouldWarnAboutExpiration(tokenKey: string = 'admin_access_token'): boolean {
    const tokenInfo = this.getTokenInfo(tokenKey);
    if (!tokenInfo) return false;
    
    const timeLeft = tokenInfo.expiresAt - Date.now();
    return timeLeft > 0 && timeLeft <= (10 * 60 * 1000); // Warn 10 minutes before expiry
  }
}

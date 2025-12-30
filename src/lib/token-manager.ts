/**
 * Token Manager Wrapper
 * Re-exports TokenManager from utils for backward compatibility
 */

import { TokenManager } from '@/utils/token-manager';

// Create singleton instance
export const tokenManager = {
  getTimeUntilExpiry: (isAdmin?: boolean) => {
    const tokenKey = isAdmin ? 'admin_access_token' : 'auth_token';
    return TokenManager.getTimeUntilExpiry(tokenKey);
  },

  refreshToken: async (isAdmin?: boolean): Promise<boolean> => {
    // Note: The TokenManager class doesn't have a refreshToken method
    // This would need to be implemented or use the API client
    console.warn('Token refresh not implemented in TokenManager');
    return false;
  },

  clearAll: () => {
    TokenManager.clearAllTokens();
  },

  // Re-export all static methods
  decodeToken: TokenManager.decodeToken.bind(TokenManager),
  isTokenExpired: TokenManager.isTokenExpired.bind(TokenManager),
  getTokenInfo: TokenManager.getTokenInfo.bind(TokenManager),
  startTokenMonitoring: TokenManager.startTokenMonitoring.bind(TokenManager),
  stopTokenMonitoring: TokenManager.stopTokenMonitoring.bind(TokenManager),
  shouldWarnAboutExpiration: TokenManager.shouldWarnAboutExpiration.bind(TokenManager),
};

// Also export the class itself
export { TokenManager };

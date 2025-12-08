"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { TokenManager } from "@/utils/token-manager";

interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
  admin_role?: string; // "full" or "view_only"
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing admin session on mount and start token monitoring
  useEffect(() => {
    checkExistingSession();

    // Start token monitoring
    TokenManager.startTokenMonitoring(() => {
      console.log("Admin token expired, logging out");
      setUser(null);
      setError("Your session has expired. Please log in again.");
      TokenManager.clearAllTokens();
      window.location.href = "/admin";
    });

    // Cleanup on unmount
    return () => {
      TokenManager.stopTokenMonitoring();
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem("admin_access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user info
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: AdminUser = await response.json();

        if (userData.is_admin) {
          setUser(userData);
        } else {
          // Not an admin, clear tokens
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
        }
      } else if (response.status === 401) {
        // Token expired or invalid, clear it and redirect
        console.log("Admin token expired, redirecting to login");
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");

        // Redirect to admin login if on admin page
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin";
        }
      } else {
        // Other error, clear tokens
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
      }
    } catch (err) {
      console.error("Error checking admin session:", err);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AdminUser> => {
    setError(null);
    setLoading(true);

    try {
      // Step 1: Login with email and password
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const tokenData = await loginResponse.json();

      // Store tokens
      localStorage.setItem("admin_access_token", tokenData.access_token);
      localStorage.setItem("admin_refresh_token", tokenData.refresh_token);

      // Step 2: Get user info
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user information");
      }

      const userData: AdminUser = await userResponse.json();

      // Step 3: Verify admin status
      if (!userData.is_admin) {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        throw new Error("Access denied: Admin privileges required");
      }

      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Get token before clearing it
    const token = localStorage.getItem("admin_access_token");

    // Clear state and local storage first
    setUser(null);
    setError(null);
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");

    // Optional: Call logout endpoint to invalidate token on server
    if (token) {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore logout errors - client-side cleanup is more important
        console.log(
          "Logout API call failed, but proceeding with client-side logout"
        );
      }
    }

    // Only redirect if not already on admin page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      // If already on /admin or /admin/, just reload to show login
      if (currentPath === "/admin" || currentPath === "/admin/") {
        window.location.reload();
      } else if (currentPath.startsWith("/admin")) {
        // If on a sub-page of admin, redirect to admin login
        window.location.href = "/admin";
      }
      // If not on admin page at all, don't redirect (shouldn't happen)
    }
  };

  const value: AdminAuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    error,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

// Utility function to get admin token for API calls
export function getAdminToken(): string | null {
  return localStorage.getItem("admin_access_token");
}

// Utility function to make authenticated admin API calls
export async function adminApiCall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("No admin token available");
  }

  // Add base URL if the URL is relative
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Build the full URL
  let fullUrl: string;
  if (url.startsWith("http")) {
    fullUrl = url;
  } else {
    // Remove leading slash if present for clean joining
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    fullUrl = `${API_BASE_URL}/${cleanUrl}`;
  }

  return fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

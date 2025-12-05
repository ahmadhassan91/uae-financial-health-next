"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { NationalBondsLogo } from "@/components/NationalBondsLogo";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface AdminLoginFormProps {
  onSuccess?: (user: AdminUser) => void;
  onBack?: () => void;
}

interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
}

export function AdminLoginForm({ onSuccess, onBack }: AdminLoginFormProps) {
  const { t } = useLocalization();
  const { login, loading: authLoading, error: authError } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userData = await login(formData.email, formData.password);

      // Success - call onSuccess callback
      if (onSuccess) {
        onSuccess(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <NationalBondsLogo
              className="h-12"
              width={220}
              height={55}
              variant="primary"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
          </div>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@nationalbonds.ae"
                required
                disabled={authLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={authLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={authLoading || !formData.email || !formData.password}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>

              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={authLoading}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              Demo Admin Credentials:
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <strong>Email:</strong> admin@nationalbonds.ae
              </div>
              <div>
                <strong>Password:</strong> admin123
              </div>
            </div>
            <h4 className="font-medium text-sm mb-2">
              Demo View Only Admin Credentials:
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <strong>Email:</strong> viewonly@nationalbonds.ae
              </div>
              <div>
                <strong>Password:</strong> viewonly123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

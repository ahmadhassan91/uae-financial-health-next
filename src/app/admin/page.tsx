"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FinancialClinicAdminDashboard } from "@/components/FinancialClinicAdminDashboard";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { useAdminAuth, AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminLocalizationProvider } from "@/contexts/AdminLocalizationContext";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

function AuthenticatedAdminDashboard({ onBack }: { onBack: () => void }) {
  // The new FinancialClinicAdminDashboard handles all data fetching internally
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <FinancialClinicAdminDashboard onBack={onBack} />
    </div>
  );
}

function AdminPageContent() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAdminAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoginSuccess = (adminUser: any) => {
    toast.success(`Welcome back, ${adminUser.username}!`);
  };

  const handleBackToHome = () => {
    // Only navigate to home if explicitly requested (from login page)
    // Don't navigate on logout - stay on admin page
    if (isAuthenticated) {
      router.push("/");
    }
  };

  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Loading Admin Dashboard</CardTitle>
            <CardDescription>
              Please wait while we load the dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onSuccess={handleLoginSuccess}
        onBack={handleBackToHome}
      />
    );
  }

  // Show admin dashboard if authenticated
  return <AuthenticatedAdminDashboard onBack={handleBackToHome} />;
}

export default function AdminPage() {
  return (
    <AdminLocalizationProvider>
      <AdminAuthProvider>
        <AdminPageContent />
      </AdminAuthProvider>
    </AdminLocalizationProvider>
  );
}

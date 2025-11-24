import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { SimpleAuthProvider } from "@/hooks/use-simple-auth";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import "@/styles/rtl.css";

export const metadata: Metadata = {
  title: "Financial Clinic | National Bonds",
  description:
    "Assess your financial wellness with our comprehensive financial health check tool. Get personalized recommendations and track your progress over time.",
  keywords:
    "financial health, UAE, National Bonds Corporation, NBC, financial wellness, assessment",
  authors: [{ name: "National Bonds Corporation" }],
  icons: {
    icon: "/newicon.svg",
    apple: "/logos/nbc-logo-01.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LocalizationProvider>
          <AuthProvider>
            <SimpleAuthProvider>
              <ClientErrorBoundary>
                {children}
                <Toaster />
              </ClientErrorBoundary>
            </SimpleAuthProvider>
          </AuthProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}

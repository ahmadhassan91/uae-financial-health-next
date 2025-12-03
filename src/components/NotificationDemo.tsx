"use client";

import React from "react";
import { notify } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Demo component showcasing all notification types
 * This can be used for testing or as a reference
 */
export function NotificationDemo() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Demo</CardTitle>
          <CardDescription>
            Click the buttons below to see different notification styles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Notifications</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  notify.success("Success!", "Operation completed successfully")
                }
                variant="default"
              >
                Success
              </Button>
              <Button
                onClick={() => notify.error("Error!", "Something went wrong")}
                variant="destructive"
              >
                Error
              </Button>
              <Button
                onClick={() =>
                  notify.warning("Warning!", "Please review your input")
                }
                variant="outline"
              >
                Warning
              </Button>
              <Button
                onClick={() => notify.info("Info", "Here is some information")}
                variant="secondary"
              >
                Info
              </Button>
              <Button
                onClick={() => {
                  const id = notify.loading("Loading...", "Please wait");
                  setTimeout(() => notify.dismiss(id), 2000);
                }}
                variant="outline"
              >
                Loading
              </Button>
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Authentication</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => notify.auth.loginSuccess("John Doe")}>
                Login Success
              </Button>
              <Button
                onClick={() => notify.auth.loginError("Invalid credentials")}
              >
                Login Error
              </Button>
              <Button onClick={() => notify.auth.sessionExpired()}>
                Session Expired
              </Button>
              <Button onClick={() => notify.auth.logoutSuccess()}>
                Logout
              </Button>
              <Button onClick={() => notify.auth.unauthorized()}>
                Unauthorized
              </Button>
            </div>
          </div>

          {/* Email */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Email Notifications</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => notify.email.sent("user@example.com")}>
                Email Sent
              </Button>
              <Button onClick={() => notify.email.failed("SMTP error")}>
                Email Failed
              </Button>
              <Button onClick={() => notify.email.otpSent()}>OTP Sent</Button>
            </div>
          </div>

          {/* Data Operations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Operations</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => notify.data.saved("User profile")}>
                Saved
              </Button>
              <Button onClick={() => notify.data.deleted("Document")}>
                Deleted
              </Button>
              <Button onClick={() => notify.data.updated("Settings")}>
                Updated
              </Button>
              <Button onClick={() => notify.data.copied()}>Copied</Button>
              <Button onClick={() => notify.data.refreshed()}>Refreshed</Button>
            </div>
          </div>

          {/* File Operations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">File Operations</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => notify.file.uploaded("document.pdf")}>
                Upload Success
              </Button>
              <Button
                onClick={() => notify.file.uploadFailed("File too large")}
              >
                Upload Failed
              </Button>
              <Button onClick={() => notify.file.downloaded("report.xlsx")}>
                Download Success
              </Button>
              <Button onClick={() => notify.file.downloadFailed()}>
                Download Failed
              </Button>
            </div>
          </div>

          {/* Export */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Export Operations</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const id = notify.export.started();
                  setTimeout(() => {
                    notify.dismiss(id);
                    notify.export.success("csv");
                  }, 2000);
                }}
              >
                Export CSV
              </Button>
              <Button
                onClick={() => {
                  const id = notify.export.started();
                  setTimeout(() => {
                    notify.dismiss(id);
                    notify.export.failed("Server timeout");
                  }, 2000);
                }}
              >
                Export Failed
              </Button>
            </div>
          </div>

          {/* Validation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Validation</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => notify.validation.required("Email address")}
              >
                Required Field
              </Button>
              <Button onClick={() => notify.validation.invalid("phone number")}>
                Invalid Input
              </Button>
              <Button onClick={() => notify.validation.formError()}>
                Form Error
              </Button>
            </div>
          </div>

          {/* Network */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Network Issues</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => notify.network.offline()}>Offline</Button>
              <Button onClick={() => notify.network.serverError()}>
                Server Error
              </Button>
              <Button onClick={() => notify.network.timeout()}>Timeout</Button>
            </div>
          </div>

          {/* Promise-based */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Promise-based</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const mockPromise = new Promise((resolve) =>
                    setTimeout(() => resolve({ name: "John" }), 2000)
                  );
                  notify.promise(mockPromise, {
                    loading: "Saving user...",
                    success: (data: any) => `User ${data.name} saved!`,
                    error: "Failed to save user",
                  });
                }}
              >
                Promise Success
              </Button>
              <Button
                onClick={() => {
                  const mockPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Network error")), 2000)
                  );
                  notify.promise(mockPromise, {
                    loading: "Loading data...",
                    success: "Data loaded!",
                    error: (err: Error) => `Error: ${err.message}`,
                  });
                }}
              >
                Promise Error
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

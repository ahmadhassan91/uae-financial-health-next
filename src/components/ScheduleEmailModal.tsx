import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Mail, X } from "lucide-react";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiClient } from "@/lib/api-client";

interface ScheduleEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: {
    statusFilter: string;
    sourceFilter: string;
  };
}

export function ScheduleEmailModal({
  open,
  onOpenChange,
  currentFilters,
}: ScheduleEmailModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState(
    `Consultation Leads Export - ${new Date().toLocaleDateString()}`
  );
  const [scheduledDate, setScheduledDate] = useState<Date>(
    new Date(Date.now() + 60 * 60 * 1000)
  ); // Default to 1 hour from now
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      toast.error("This email address is already added");
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    if (!scheduledDate || scheduledDate <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = (await apiClient.request(
        "/consultations/admin/schedule-email",
        {
          method: "POST",
          body: JSON.stringify({
            recipient_emails: emails,
            subject: subject,
            scheduled_datetime: scheduledDate.toISOString(),
            status_filter:
              currentFilters.statusFilter !== "all"
                ? currentFilters.statusFilter
                : null,
            source_filter:
              currentFilters.sourceFilter !== "all"
                ? currentFilters.sourceFilter
                : null,
          }),
        }
      )) as { success: boolean; message?: string };

      if (response.success) {
        toast.success("Email scheduled successfully!");
        onOpenChange(false);
        // Reset form
        setEmails([]);
        setEmailInput("");
        setSubject(
          `Consultation Leads Export - ${new Date().toLocaleDateString()}`
        );
        setScheduledDate(new Date(Date.now() + 60 * 60 * 1000));
      } else {
        toast.error("Failed to schedule email");
      }
    } catch (error: any) {
      console.error("Error scheduling email:", error);
      const errorMessage =
        error?.detail ||
        error?.message ||
        "An error occurred while scheduling the email";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule Email Export</DialogTitle>
          <DialogDescription>
            Schedule a CSV export of consultation leads to be emailed at a
            specific time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Recipients */}
          <div className="space-y-2">
            <Label htmlFor="emails">Recipient Email Addresses</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="emails"
                  type="email"
                  placeholder="Enter email address and press Enter"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddEmail}
                  variant="outline"
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Email Tags */}
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {emails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {emails.length} recipient{emails.length !== 1 ? "s" : ""} added
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <Label>Schedule Date & Time</Label>
            <div className="relative">
              <DatePicker
                selected={scheduledDate}
                onChange={(date) => date && setScheduledDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                wrapperClassName="w-full"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {/* Active Filters Info */}
          {(currentFilters.statusFilter !== "all" ||
            currentFilters.sourceFilter !== "all") && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Active Filters:
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                {currentFilters.statusFilter !== "all" && (
                  <div>
                    • Status:{" "}
                    <span className="font-medium capitalize">
                      {currentFilters.statusFilter}
                    </span>
                  </div>
                )}
                {currentFilters.sourceFilter !== "all" && (
                  <div>
                    • Source:{" "}
                    <span className="font-medium capitalize">
                      {currentFilters.sourceFilter.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

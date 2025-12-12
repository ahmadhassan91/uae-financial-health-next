import { toast } from "sonner";

/**
 * Beautiful notification system with consistent styling
 */

export const notify = {
  // Success notifications
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  },

  // Error notifications
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    });
  },

  // Warning notifications
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    });
  },

  // Info notifications
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    });
  },

  // Loading notifications (returns toast id for dismissal)
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    });
  },

  // Dismiss a specific toast
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  // Promise-based notification (auto handles loading, success, error)
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  // Specific use-case notifications
  auth: {
    loginSuccess: (username?: string) => {
      toast.success("Login Successful", {
        description: username
          ? `Welcome back, ${username}!`
          : "You have been logged in successfully.",
      });
    },

    loginError: (error?: string) => {
      toast.error("Login Failed", {
        description: error || "Invalid credentials. Please try again.",
      });
    },

    logoutSuccess: () => {
      toast.info("Logged Out", {
        description: "You have been logged out successfully.",
      });
    },

    sessionExpired: () => {
      toast.warning("Session Expired", {
        description: "Your session has expired. Please log in again.",
        duration: 6000,
      });
    },

    unauthorized: () => {
      toast.error("Unauthorized Access", {
        description: "You do not have permission to access this resource.",
      });
    },
  },

  email: {
    sent: (recipient?: string) => {
      toast.success("Email Sent", {
        description: recipient
          ? `Email sent successfully to ${recipient}`
          : "Email sent successfully.",
      });
    },

    failed: (error?: string) => {
      toast.error("Email Failed", {
        description: error || "Failed to send email. Please try again.",
      });
    },

    otpSent: () => {
      toast.success("OTP Sent", {
        description: "A verification code has been sent to your email.",
      });
    },
  },

  data: {
    saved: (itemName?: string) => {
      toast.success("Saved Successfully", {
        description: itemName
          ? `${itemName} has been saved.`
          : "Your changes have been saved.",
      });
    },

    deleted: (itemName?: string) => {
      toast.success("Deleted Successfully", {
        description: itemName
          ? `${itemName} has been deleted.`
          : "Item has been deleted.",
      });
    },

    updated: (itemName?: string) => {
      toast.success("Updated Successfully", {
        description: itemName
          ? `${itemName} has been updated.`
          : "Your changes have been saved.",
      });
    },

    copied: () => {
      toast.success("Copied to Clipboard", {
        description: "Content has been copied to your clipboard.",
        duration: 2000,
      });
    },

    refreshed: () => {
      toast.success("Data Refreshed", {
        description: "The latest data has been loaded.",
        duration: 2000,
      });
    },
  },

  file: {
    uploaded: (fileName?: string) => {
      toast.success("Upload Successful", {
        description: fileName
          ? `${fileName} uploaded successfully.`
          : "File uploaded successfully.",
      });
    },

    uploadFailed: (error?: string) => {
      toast.error("Upload Failed", {
        description: error || "Failed to upload file. Please try again.",
      });
    },

    downloaded: (fileName?: string) => {
      toast.success("Download Complete", {
        description: fileName
          ? `${fileName} downloaded successfully.`
          : "File downloaded successfully.",
      });
    },

    downloadFailed: (error?: string) => {
      toast.error("Download Failed", {
        description: error || "Failed to download file. Please try again.",
      });
    },
  },

  export: {
    started: () => {
      return toast.loading("Exporting Data", {
        description: "Please wait while we prepare your export...",
      });
    },

    success: (format: string) => {
      toast.success("Export Complete", {
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      });
    },

    failed: (error?: string) => {
      toast.error("Export Failed", {
        description: error || "Failed to export data. Please try again.",
      });
    },
  },

  validation: {
    required: (fieldName: string) => {
      toast.error("Required Field", {
        description: `${fieldName} is required.`,
      });
    },

    invalid: (fieldName: string) => {
      toast.error("Invalid Input", {
        description: `Please enter a valid ${fieldName}.`,
      });
    },

    formError: (message?: string) => {
      toast.error("Form Validation Error", {
        description: message || "Please check the form and try again.",
      });
    },
  },

  network: {
    offline: () => {
      toast.error("No Internet Connection", {
        description: "Please check your internet connection and try again.",
        duration: 6000,
      });
    },

    serverError: () => {
      toast.error("Server Error", {
        description: "Something went wrong on our end. Please try again later.",
      });
    },

    timeout: () => {
      toast.error("Request Timeout", {
        description: "The request took too long. Please try again.",
      });
    },
  },
};

// Export default toast for custom usage
export { toast };

import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Mail,
  LogOut,
  Upload,
  Download,
  Trash2,
  Save,
  Copy,
  RefreshCw,
} from "lucide-react";

/**
 * Beautiful notification system with consistent styling and icons
 */

export const notify = {
  // Success notifications
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 className="w-5 h-5" />,
    });
  },

  // Error notifications
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="w-5 h-5" />,
    });
  },

  // Warning notifications
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="w-5 h-5" />,
    });
  },

  // Info notifications
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="w-5 h-5" />,
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
        icon: <CheckCircle2 className="w-5 h-5" />,
      });
    },

    loginError: (error?: string) => {
      toast.error("Login Failed", {
        description: error || "Invalid credentials. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    logoutSuccess: () => {
      toast.info("Logged Out", {
        description: "You have been logged out successfully.",
        icon: <LogOut className="w-5 h-5" />,
      });
    },

    sessionExpired: () => {
      toast.warning("Session Expired", {
        description: "Your session has expired. Please log in again.",
        icon: <Clock className="w-5 h-5" />,
        duration: 6000,
      });
    },

    unauthorized: () => {
      toast.error("Unauthorized Access", {
        description: "You do not have permission to access this resource.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  email: {
    sent: (recipient?: string) => {
      toast.success("Email Sent", {
        description: recipient
          ? `Email sent successfully to ${recipient}`
          : "Email sent successfully.",
        icon: <Mail className="w-5 h-5" />,
      });
    },

    failed: (error?: string) => {
      toast.error("Email Failed", {
        description: error || "Failed to send email. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    otpSent: () => {
      toast.success("OTP Sent", {
        description: "A verification code has been sent to your email.",
        icon: <Mail className="w-5 h-5" />,
      });
    },
  },

  data: {
    saved: (itemName?: string) => {
      toast.success("Saved Successfully", {
        description: itemName
          ? `${itemName} has been saved.`
          : "Your changes have been saved.",
        icon: <Save className="w-5 h-5" />,
      });
    },

    deleted: (itemName?: string) => {
      toast.success("Deleted Successfully", {
        description: itemName
          ? `${itemName} has been deleted.`
          : "Item has been deleted.",
        icon: <Trash2 className="w-5 h-5" />,
      });
    },

    updated: (itemName?: string) => {
      toast.success("Updated Successfully", {
        description: itemName
          ? `${itemName} has been updated.`
          : "Your changes have been saved.",
        icon: <CheckCircle2 className="w-5 h-5" />,
      });
    },

    copied: () => {
      toast.success("Copied to Clipboard", {
        description: "Content has been copied to your clipboard.",
        icon: <Copy className="w-5 h-5" />,
        duration: 2000,
      });
    },

    refreshed: () => {
      toast.success("Data Refreshed", {
        description: "The latest data has been loaded.",
        icon: <RefreshCw className="w-5 h-5" />,
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
        icon: <Upload className="w-5 h-5" />,
      });
    },

    uploadFailed: (error?: string) => {
      toast.error("Upload Failed", {
        description: error || "Failed to upload file. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    downloaded: (fileName?: string) => {
      toast.success("Download Complete", {
        description: fileName
          ? `${fileName} downloaded successfully.`
          : "File downloaded successfully.",
        icon: <Download className="w-5 h-5" />,
      });
    },

    downloadFailed: (error?: string) => {
      toast.error("Download Failed", {
        description: error || "Failed to download file. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
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
        icon: <Download className="w-5 h-5" />,
      });
    },

    failed: (error?: string) => {
      toast.error("Export Failed", {
        description: error || "Failed to export data. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  validation: {
    required: (fieldName: string) => {
      toast.error("Required Field", {
        description: `${fieldName} is required.`,
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },

    invalid: (fieldName: string) => {
      toast.error("Invalid Input", {
        description: `Please enter a valid ${fieldName}.`,
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },

    formError: (message?: string) => {
      toast.error("Form Validation Error", {
        description: message || "Please check the form and try again.",
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },
  },

  network: {
    offline: () => {
      toast.error("No Internet Connection", {
        description: "Please check your internet connection and try again.",
        icon: <XCircle className="w-5 h-5" />,
        duration: 6000,
      });
    },

    serverError: () => {
      toast.error("Server Error", {
        description: "Something went wrong on our end. Please try again later.",
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    timeout: () => {
      toast.error("Request Timeout", {
        description: "The request took too long. Please try again.",
        icon: <Clock className="w-5 h-5" />,
      });
    },
  },
};

// Export default toast for custom usage
export { toast };

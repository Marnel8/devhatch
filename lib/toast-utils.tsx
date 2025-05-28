"use client"

import React from "react"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, Star } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info" | "loading" | "custom"

interface ToastOptions {
  duration?: number
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Success toast with checkmark icon
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    duration: options?.duration || 4000,
    dismissible: options?.dismissible !== false,
    icon: <CheckCircle className="h-4 w-4" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Error toast with X icon
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    duration: options?.duration || 6000,
    dismissible: options?.dismissible !== false,
    icon: <XCircle className="h-4 w-4" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Warning toast with warning icon
export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    duration: options?.duration || 5000,
    dismissible: options?.dismissible !== false,
    icon: <AlertTriangle className="h-4 w-4" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Info toast with info icon
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    duration: options?.duration || 4000,
    dismissible: options?.dismissible !== false,
    icon: <Info className="h-4 w-4" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Loading toast with spinner
export const showLoadingToast = (message: string, options?: Omit<ToastOptions, "duration">) => {
  return toast.loading(message, {
    dismissible: options?.dismissible !== false,
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Custom toast with custom icon and styling
export const showCustomToast = (
  message: string, 
  icon?: React.ReactNode, 
  options?: ToastOptions
) => {
  return toast(message, {
    duration: options?.duration || 4000,
    dismissible: options?.dismissible !== false,
    icon: icon || <Star className="h-4 w-4" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Promise toast for async operations
export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  },
  options?: ToastOptions
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      return typeof messages.success === "function" 
        ? messages.success(data) 
        : messages.success
    },
    error: (error) => {
      return typeof messages.error === "function" 
        ? messages.error(error) 
        : messages.error
    },
    duration: options?.duration || 4000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss()
}

// Dismiss specific toast by ID
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId)
}

// Convenience functions for common use cases
export const toastUtils = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  custom: showCustomToast,
  promise: showPromiseToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
}

// Auth-specific toast helpers
export const authToasts = {
  loginSuccess: (name?: string) => 
    showSuccessToast(
      name ? `Welcome back, ${name}!` : "Successfully logged in!",
      { duration: 3000 }
    ),
  
  loginError: (error?: string) => 
    showErrorToast(
      error || "Failed to login. Please check your credentials.",
      { duration: 5000 }
    ),
  
  logoutSuccess: () => 
    showInfoToast("You have been logged out successfully.", { duration: 3000 }),
  
  registrationSuccess: () => 
    showSuccessToast("Account created successfully! Please log in.", { duration: 4000 }),
  
  registrationError: (error?: string) => 
    showErrorToast(
      error || "Failed to create account. Please try again.",
      { duration: 5000 }
    ),
  
  passwordResetSent: () => 
    showInfoToast("Password reset email sent. Check your inbox.", { duration: 4000 }),
  
  unauthorized: () => 
    showWarningToast("You need to log in to access this page.", { duration: 4000 }),
}

// Form-specific toast helpers
export const formToasts = {
  saveSuccess: () => 
    showSuccessToast("Changes saved successfully!", { duration: 3000 }),
  
  saveError: (error?: string) => 
    showErrorToast(
      error || "Failed to save changes. Please try again.",
      { duration: 5000 }
    ),
  
  validationError: (message?: string) => 
    showWarningToast(
      message || "Please check your input and try again.",
      { duration: 4000 }
    ),
  
  deleteSuccess: (itemName?: string) => 
    showSuccessToast(
      itemName ? `${itemName} deleted successfully!` : "Item deleted successfully!",
      { duration: 3000 }
    ),
  
  deleteError: (error?: string) => 
    showErrorToast(
      error || "Failed to delete item. Please try again.",
      { duration: 5000 }
    ),
}

// File operation toast helpers
export const fileToasts = {
  uploadStart: (fileName: string) => 
    showLoadingToast(`Uploading ${fileName}...`),
  
  uploadSuccess: (fileName: string) => 
    showSuccessToast(`${fileName} uploaded successfully!`, { duration: 3000 }),
  
  uploadError: (fileName: string, error?: string) => 
    showErrorToast(
      error || `Failed to upload ${fileName}. Please try again.`,
      { duration: 5000 }
    ),
  
  downloadStart: (fileName: string) => 
    showLoadingToast(`Downloading ${fileName}...`),
  
  downloadSuccess: (fileName: string) => 
    showSuccessToast(`${fileName} downloaded successfully!`, { duration: 3000 }),
  
  downloadError: (fileName: string, error?: string) => 
    showErrorToast(
      error || `Failed to download ${fileName}. Please try again.`,
      { duration: 5000 }
    ),
} 
# Toast Notification System

A comprehensive and user-friendly toast notification system for the DevHatch OJT Portal, built with Sonner and custom utilities.

## 🚀 Features

- **Multiple Toast Types**: Success, Error, Warning, Info, Loading, and Custom toasts
- **Rich Animations**: Smooth slide-in/out animations with backdrop blur effects
- **Interactive Elements**: Action buttons, cancel buttons, and dismissible toasts
- **Promise Support**: Automatic toast updates based on promise resolution
- **Theme Support**: Automatic light/dark theme adaptation
- **Predefined Collections**: Auth, Form, and File operation toasts
- **TypeScript Support**: Full type safety and IntelliSense
- **Responsive Design**: Optimized for all screen sizes

## 📦 Installation

The toast system is already integrated into the project. Both Sonner and Radix UI toast systems are available.

## 🎨 Quick Start

### Basic Usage

```tsx
import { toastUtils } from "@/lib/toast-utils"

// Success toast
toastUtils.success("Operation completed successfully! 🎉")

// Error toast
toastUtils.error("Something went wrong. Please try again.")

// Warning toast
toastUtils.warning("Please check your input before proceeding.")

// Info toast
toastUtils.info("New feature available! Check it out.")

// Loading toast
toastUtils.loading("Processing your request...")
```

### Authentication Toasts

```tsx
import { authToasts } from "@/lib/toast-utils"

// Login success
authToasts.loginSuccess("John Doe") // With name
authToasts.loginSuccess() // Without name

// Login error
authToasts.loginError("Invalid credentials")

// Logout
authToasts.logoutSuccess()

// Unauthorized access
authToasts.unauthorized()

// Registration
authToasts.registrationSuccess()
authToasts.registrationError("Email already exists")

// Password reset
authToasts.passwordResetSent()
```

### Form Operation Toasts

```tsx
import { formToasts } from "@/lib/toast-utils"

// Save operations
formToasts.saveSuccess()
formToasts.saveError("Network connection failed")

// Validation
formToasts.validationError("Please fill all required fields")

// Delete operations
formToasts.deleteSuccess("User profile")
formToasts.deleteError("Cannot delete active user")
```

### File Operation Toasts

```tsx
import { fileToasts } from "@/lib/toast-utils"

// Upload operations
const loadingId = fileToasts.uploadStart("resume.pdf")
fileToasts.uploadSuccess("resume.pdf")
fileToasts.uploadError("resume.pdf", "File too large")

// Download operations
fileToasts.downloadStart("report.xlsx")
fileToasts.downloadSuccess("report.xlsx")
fileToasts.downloadError("report.xlsx", "File not found")
```

## 🎛️ Advanced Usage

### Custom Toasts with Actions

```tsx
import { showCustomToast } from "@/lib/toast-utils"
import { Star } from "lucide-react"

showCustomToast(
  "Would you like to upgrade to Pro?",
  <Star className="h-4 w-4 text-yellow-500" />,
  {
    duration: 6000,
    action: {
      label: "Upgrade",
      onClick: () => {
        // Handle upgrade action
        console.log("Redirecting to upgrade page...")
      }
    }
  }
)
```

### Promise-based Toasts

```tsx
import { showPromiseToast } from "@/lib/toast-utils"

const saveUserData = async (userData) => {
  // Your async operation
  return await api.saveUser(userData)
}

showPromiseToast(
  saveUserData(userData),
  {
    loading: "Saving user data...",
    success: (result) => `User ${result.name} saved successfully!`,
    error: (error) => `Failed to save user: ${error.message}`
  },
  { duration: 4000 }
)
```

### Loading Toasts with Manual Control

```tsx
import { showLoadingToast, toastUtils } from "@/lib/toast-utils"

const performLongOperation = async () => {
  const loadingToastId = showLoadingToast("Processing your request...")
  
  try {
    await longRunningOperation()
    toastUtils.dismiss(loadingToastId)
    toastUtils.success("Operation completed successfully!")
  } catch (error) {
    toastUtils.dismiss(loadingToastId)
    toastUtils.error("Operation failed. Please try again.")
  }
}
```

## 🎨 Customization Options

### Toast Options

```tsx
interface ToastOptions {
  duration?: number              // Auto-dismiss duration in ms
  dismissible?: boolean         // Whether toast can be manually dismissed
  action?: {                   // Action button
    label: string
    onClick: () => void
  }
  cancel?: {                   // Cancel button
    label: string
    onClick?: () => void
  }
}
```

### Custom Icons

```tsx
import { showCustomToast } from "@/lib/toast-utils"
import { Heart, Zap, Coffee } from "lucide-react"

// With custom Lucide icon
showCustomToast(
  "Welcome to DevHatch! 🚀",
  <Heart className="h-4 w-4 text-red-500" />
)

// With emoji
showCustomToast("Update available! ⚡")

// With complex custom element
showCustomToast(
  "Coffee break time!",
  <div className="flex items-center space-x-1">
    <Coffee className="h-4 w-4" />
    <span>☕</span>
  </div>
)
```

## 🎭 Theme Integration

The toast system automatically adapts to your app's theme:

- **Light Theme**: Clean, bright colors with subtle shadows
- **Dark Theme**: Dark backgrounds with appropriate contrast
- **System Theme**: Follows system preferences

Colors are defined in the Sonner component configuration and use CSS custom properties for seamless theme integration.

## 📱 Demo Page

Visit `/toast-demo` to see all toast types in action and test the different configurations.

## 🛠️ Utility Functions

```tsx
import { toastUtils } from "@/lib/toast-utils"

// Dismiss specific toast by ID
const toastId = toastUtils.success("Message")
toastUtils.dismiss(toastId)

// Dismiss all toasts
toastUtils.dismissAll()
```

## 🎯 Best Practices

### 1. Choose the Right Toast Type
- **Success**: Completed actions, successful operations
- **Error**: Failed operations, validation errors
- **Warning**: Important notices, potential issues
- **Info**: General information, tips, updates
- **Loading**: Ongoing operations, processing states

### 2. Message Guidelines
- Keep messages concise and actionable
- Use active voice: "Data saved successfully" vs "Data has been saved"
- Include relevant details: "File 'resume.pdf' uploaded successfully"
- Provide next steps when appropriate

### 3. Duration Guidelines
- **Success**: 3-4 seconds (users want quick confirmation)
- **Error**: 5-6 seconds (users need time to read and understand)
- **Warning**: 4-5 seconds (important but not critical)
- **Info**: 3-4 seconds (quick information)
- **Loading**: No duration (dismiss manually when done)

### 4. Action Buttons
- Use action buttons for reversible actions: "Undo", "Retry"
- Provide cancel options for long-running operations
- Keep action labels short and descriptive

### 5. Performance
- Avoid showing too many toasts simultaneously (limit: 5)
- Use promise toasts for async operations to reduce toast spam
- Dismiss previous loading toasts before showing new ones

## 🚨 Common Patterns

### Form Submission
```tsx
const handleSubmit = async (formData) => {
  const loadingToastId = showLoadingToast("Saving changes...")
  
  try {
    await saveFormData(formData)
    toastUtils.dismiss(loadingToastId)
    formToasts.saveSuccess()
    router.push("/success-page")
  } catch (error) {
    toastUtils.dismiss(loadingToastId)
    formToasts.saveError(error.message)
  }
}
```

### Authentication Flow
```tsx
const handleLogin = async (email, password) => {
  try {
    const user = await login(email, password)
    authToasts.loginSuccess(user.name)
    router.push("/dashboard")
  } catch (error) {
    authToasts.loginError(error.message)
  }
}
```

### File Upload with Progress
```tsx
const handleFileUpload = async (file) => {
  const uploadPromise = uploadFile(file)
  
  showPromiseToast(uploadPromise, {
    loading: `Uploading ${file.name}...`,
    success: `${file.name} uploaded successfully!`,
    error: `Failed to upload ${file.name}. Please try again.`
  })
}
```

## 🔧 Configuration

The toast system is configured in:
- `components/ui/sonner.tsx` - Sonner configuration and theming
- `lib/toast-utils.tsx` - Utility functions and predefined toasts
- `app/layout.tsx` - Toast provider integration

## 📚 API Reference

### Core Functions
- `showSuccessToast(message, options?)`
- `showErrorToast(message, options?)`
- `showWarningToast(message, options?)`
- `showInfoToast(message, options?)`
- `showLoadingToast(message, options?)`
- `showCustomToast(message, icon?, options?)`
- `showPromiseToast(promise, messages, options?)`

### Collections
- `authToasts.*` - Authentication-related toasts
- `formToasts.*` - Form operation toasts  
- `fileToasts.*` - File operation toasts
- `toastUtils.*` - General utility functions

### Management
- `dismissToast(id)` - Dismiss specific toast
- `dismissAllToasts()` - Dismiss all toasts

---

## 🎉 Ready to Toast!

The toast notification system is now ready to enhance your user experience. Start with the basic examples and gradually explore the advanced features as needed.

For live examples and testing, visit the demo page at `/toast-demo`. 
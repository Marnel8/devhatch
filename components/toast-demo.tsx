"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  toastUtils, 
  authToasts, 
  formToasts, 
  fileToasts,
  showCustomToast,
  showPromiseToast
} from "@/lib/toast-utils"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  Star,
  Heart,
  Zap,
  Gift,
  Trophy,
  Rocket,
  Coffee
} from "lucide-react"

export default function ToastDemo() {
  // Demo async function for promise toast
  const simulateAsyncOperation = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve("Operation completed successfully!")
        } else {
          reject(new Error("Something went wrong!"))
        }
      }, 2000)
    })
  }

  const simulateFileUpload = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("document.pdf")
      }, 3000)
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Toast Notification System</h1>
        <p className="text-muted-foreground">
          Explore all the different types of toast notifications available in DevHatch OJT Portal
        </p>
      </div>

      {/* Basic Toast Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Basic Toast Types
          </CardTitle>
          <CardDescription>
            Standard toast notifications with different variants and icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col p-4 space-y-2 border-green-200 hover:bg-green-50"
              onClick={() => toastUtils.success("Task completed successfully! 🎉")}
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-xs">Success</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-4 space-y-2 border-red-200 hover:bg-red-50"
              onClick={() => toastUtils.error("Something went wrong! Please try again.")}
            >
              <XCircle className="h-6 w-6 text-red-600" />
              <span className="text-xs">Error</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-4 space-y-2 border-yellow-200 hover:bg-yellow-50"
              onClick={() => toastUtils.warning("Please check your input before proceeding.")}
            >
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <span className="text-xs">Warning</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-4 space-y-2 border-blue-200 hover:bg-blue-50"
              onClick={() => toastUtils.info("New feature available! Check it out.")}
            >
              <Info className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Info</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-4 space-y-2 border-gray-200 hover:bg-gray-50"
              onClick={() => toastUtils.loading("Processing your request...")}
            >
              <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
              <span className="text-xs">Loading</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Toast with Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Advanced Toasts
          </CardTitle>
          <CardDescription>
            Toasts with custom icons, actions, and interactive elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-3"
              onClick={() => 
                showCustomToast(
                  "Would you like to upgrade to Pro?",
                  <Star className="h-4 w-4 text-yellow-500" />,
                  {
                    duration: 6000,
                    action: {
                      label: "Upgrade",
                      onClick: () => toastUtils.success("Redirecting to upgrade page...")
                    }
                  }
                )
              }
            >
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Toast with Actions</div>
                <div className="text-xs text-muted-foreground">Includes action and cancel buttons</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-3"
              onClick={() => 
                showCustomToast(
                  "Welcome to DevHatch! 🚀 Ready to start your journey?",
                  <Heart className="h-4 w-4 text-red-500" />,
                  { duration: 4000 }
                )
              }
            >
              <Rocket className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Custom Icon Toast</div>
                <div className="text-xs text-muted-foreground">With custom icons and emojis</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promise Toast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            Promise-based Toasts
          </CardTitle>
          <CardDescription>
            Toasts that automatically update based on promise resolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-3"
              onClick={() => 
                showPromiseToast(
                  simulateAsyncOperation(),
                  {
                    loading: "Processing your request...",
                    success: "Operation completed successfully! 🎉",
                    error: (error) => `Failed: ${error.message}`
                  }
                )
              }
            >
              <Loader2 className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Promise Toast</div>
                <div className="text-xs text-muted-foreground">Auto-updates on promise resolution</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-3"
              onClick={() => 
                showPromiseToast(
                  simulateFileUpload(),
                  {
                    loading: "Uploading file...",
                    success: (filename) => `${filename} uploaded successfully!`,
                    error: "Upload failed. Please try again."
                  }
                )
              }
            >
              <Gift className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="text-sm font-medium">File Upload Toast</div>
                <div className="text-xs text-muted-foreground">Simulates file upload progress</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Toast Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auth Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auth Toasts</CardTitle>
            <CardDescription>Authentication-related notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => authToasts.loginSuccess("John Doe")}
            >
              Login Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => authToasts.loginError("Invalid credentials")}
            >
              Login Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => authToasts.logoutSuccess()}
            >
              Logout Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => authToasts.unauthorized()}
            >
              Unauthorized
            </Button>
          </CardContent>
        </Card>

        {/* Form Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Form Toasts</CardTitle>
            <CardDescription>Form operation notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => formToasts.saveSuccess()}
            >
              Save Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => formToasts.saveError("Network error")}
            >
              Save Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => formToasts.validationError("Please fill all required fields")}
            >
              Validation Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => formToasts.deleteSuccess("User profile")}
            >
              Delete Success
            </Button>
          </CardContent>
        </Card>

        {/* File Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Toasts</CardTitle>
            <CardDescription>File operation notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => fileToasts.uploadSuccess("resume.pdf")}
            >
              Upload Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => fileToasts.uploadError("document.docx", "File too large")}
            >
              Upload Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => fileToasts.downloadSuccess("report.xlsx")}
            >
              Download Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                const loadingId = fileToasts.uploadStart("presentation.pptx")
                setTimeout(() => {
                  toastUtils.dismiss(loadingId)
                  fileToasts.uploadSuccess("presentation.pptx")
                }, 2000)
              }}
            >
              Upload Simulation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Code examples for implementing these toasts in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Basic Usage:</h4>
              <code className="text-sm">
                {`import { toastUtils } from "@/lib/toast-utils"`}<br/>
                {`toastUtils.success("Operation completed!")`}
              </code>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">With Actions:</h4>
              <code className="text-sm">
                {`showCustomToast("Message", icon, {`}<br/>
                {`  action: { label: "Action", onClick: () => {} },`}<br/>
                {`  cancel: { label: "Cancel" }`}<br/>
                {`})`}
              </code>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Promise Toast:</h4>
              <code className="text-sm">
                {`showPromiseToast(asyncFunction(), {`}<br/>
                {`  loading: "Processing...",`}<br/>
                {`  success: "Done!",`}<br/>
                {`  error: "Failed!"`}<br/>
                {`})`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utility Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Actions</CardTitle>
          <CardDescription>Control and manage toast notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toastUtils.dismissAll()}
            >
              Dismiss All Toasts
            </Button>
            <Badge variant="secondary">
              All toasts are automatically positioned and themed
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
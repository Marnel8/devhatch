"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Egg, Eye, EyeOff, User, Lock } from "lucide-react"
import Link from "next/link"
import { authToasts, showSuccessToast, showLoadingToast, showInfoToast } from "@/lib/toast-utils"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Handle redirection when user state changes after login
  useEffect(() => {
    if (user && !authLoading && loading) {
      // User has been loaded after login attempt, redirect based on role
      setRedirecting(true)
      
      if (user.role === "superadmin" || user.role === "project_admin") {
        showSuccessToast("Welcome to Admin Dashboard! 🚀", { duration: 3000 })
        router.push("/admin")
      } else {
        showSuccessToast("Welcome to your dashboard! 🎉", { duration: 3000 })
        router.push("/dashboard")
      }
      
      setLoading(false) // Reset loading state after redirect
    }
  }, [user, authLoading, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRedirecting(false)

    try {
      await login(email, password)
      
      // Show login success toast
      authToasts.loginSuccess()

      // Note: Redirection is now handled in useEffect when user state updates
    } catch (error: any) {
      authToasts.loginError(error.message)
      setLoading(false) // Only set loading false on error, success case handles it in useEffect
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16  rounded-xl flex items-center justify-center shadow-lg">
              <Image src="/logo.svg" alt="DevHatch Logo" width={48} height={48} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            DevHatch OJT Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-slate-300 focus-visible:!outline-orange-500 focus:!border-orange-500 focus:!ring-orange-500 focus:!ring-2 focus:!ring-offset-2"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-12 h-12 border-slate-300 focus-visible:!outline-orange-500 focus:!border-orange-500 focus:!ring-orange-500 focus:!ring-2 focus:!ring-offset-2"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold border-0 shadow-lg shadow-orange-500/25" 
                disabled={loading || redirecting}
              >
                {loading || redirecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{redirecting ? "Redirecting..." : "Signing in..."}</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600">
            <Link href="/" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
              ← Back to Homepage
            </Link>
          </p>
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/apply" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
              Apply for OJT
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

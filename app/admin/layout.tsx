"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Egg,
  LogOut,
  BarChart3,
  Settings,
  Menu,
  QrCode,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Database,
  Bell,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const navigation = [
    { name: "Overview", href: "/admin", icon: BarChart3, exact: true },
    { name: "Job Management", href: "/admin/jobs", icon: Briefcase },
    { name: "Applications", href: "/admin/applications", icon: FileText },
    { name: "Interns", href: "/admin/interns", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: Calendar },
    { name: "QR Scanner", href: "/admin/qr-scanner", icon: QrCode },
    { name: "Reports", href: "/admin/reports", icon: Database },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Egg className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">DevHatch</span>
            <div className="text-xs text-slate-400">Admin Portal</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-primary text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Settings & Logout */}
      <div className="px-4 py-4 border-t border-slate-700 space-y-2">
        <Link
          href="/admin/settings"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
            isActive("/admin/settings") ? "bg-primary text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Egg className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">DevHatch</span>
              <div className="text-xs text-gray-500">Admin Portal</div>
            </div>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-80">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        <main className="py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

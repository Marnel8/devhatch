import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import localFont from 'next/font/local'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const qurova = localFont({
  src: [
    {
      path: './font/QurovaDEMO-Light-BF67a5c6380ebd4.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './font/QurovaDEMO-Regular-BF67a5c637a5dc9.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './font/QurovaDEMO-Medium-BF67a5c6382651c.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './font/QurovaDEMO-SemiBold-BF67a5c637bcd0b.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './font/QurovaDEMO-Bold-BF67a5c637eed62.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-qurova',
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "DevHatch - OJT Portal",
  description: "Centralized OJT management platform for BatStateU DevOps Office - 3rd Floor, SteerHub Building",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${qurova.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

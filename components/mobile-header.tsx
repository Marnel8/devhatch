"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface MobileHeaderProps {
  showAuth?: boolean
}

export function MobileHeader({ showAuth = true }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Browse Jobs", href: "/jobs" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="DevHatch Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <p className="text-xl font-bold text-primary font-qurova">DEVHATCH</p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="ghost" size="sm">
                  {item.name}
                </Button>
              </Link>
            ))}
            {showAuth && (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button size="sm">Apply Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <Image
                      src="/logo.svg"
                      alt="DevHatch Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <span className="text-xl font-bold text-primary">DevHatch</span>
                  </div>

                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}

                  {showAuth && (
                    <div className="pt-4 border-t space-y-3 ">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full mb-2">
                          Login
                        </Button>
                      </Link>
                      <Link href="/apply" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Apply Now</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

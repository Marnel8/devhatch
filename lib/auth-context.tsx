"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { ref, get } from "firebase/database"
import { auth, database } from "@/app/lib/firebase"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setError(null)

        if (firebaseUser) {
          try {
            // Try to fetch user data from database
            const userRef = ref(database, `users/${firebaseUser.uid}`)
            let userData = null

            try {
              const snapshot = await get(userRef)
              if (snapshot.exists()) {
                userData = snapshot.val()
                console.log("✅ User data loaded from database:", userData)
              } else {
                console.log("ℹ️ No user data in database, creating mock data")
                // Create mock user data for demo if not in database
                userData = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                  role: firebaseUser.email?.includes("admin") ? "admin" : "student",
                  createdAt: new Date().toISOString(),
                }
              }
            } catch (dbError) {
              console.warn("⚠️ Database fetch failed, using mock data:", dbError)
              // Create mock user data for demo
              userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                role: firebaseUser.email?.includes("admin") ? "admin" : "student",
                createdAt: new Date().toISOString(),
              }
            }

            setUser(userData)
            setFirebaseUser(firebaseUser)
          } catch (error) {
            console.error("❌ Error processing user data:", error)
            setError("Failed to load user data")
          }
        } else {
          setUser(null)
          setFirebaseUser(null)
        }
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("❌ Firebase auth error:", error)
      setError("Authentication service unavailable")
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError(error.message || "Failed to login")
      throw error
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (error: any) {
      setError(error.message || "Failed to logout")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

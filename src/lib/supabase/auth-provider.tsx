"use client"

import { createContext, useContext, useState } from 'react'

type AuthContextType = {
  // Using any to simulate User type for the mock
  user: any | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Hardcoded to null to simulate logged out state for UI mocking
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

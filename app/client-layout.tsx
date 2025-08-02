"use client"

import { AuthProvider, useAuth } from "../src/contexts/AuthContext"
import Navbar from "../src/components/Navbar"
import "../src/styles/App.css"

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  )
}

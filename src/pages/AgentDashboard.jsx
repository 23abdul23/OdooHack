import React from "react"
import { useAuth } from "../contexts/AuthContext"

const AgentDashboard = () => {
  const { user } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}!</h1>
      <p className="text-lg">This is your Agent Dashboard.</p>
      {/* Add agent-specific dashboard content here */}
    </div>
  )
}

export default AgentDashboard

"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import ClientDashboard from "./pages/ClientDashboard"
import AgentDashboard from "./pages/AgentDashboard"
import CreateTicket from "./pages/CreateTicket"
import TicketDetail from "./pages/TicketDetail"
import AdminPanel from "./pages/AdminPanel"
import Profile from "./pages/Profile"
import "./styles/App.css"

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />

  
  // If user does not have access to this route, redirect them to their dashboard
  if (roles && !roles.includes(user.role)) {
    if (user.role === "user") return <Navigate to="/user-dashboard" />
    if (user.role === "agent") return <Navigate to="/agent-dashboard" />
    return <Navigate to="/dashboard" />
  }

  return children
}

// Dashboard Route Component - redirects based on user role
function DashboardRoute() {
  const { user } = useAuth()
  
  if (user?.role === 'admin') {
    return <AdminDashboard />
  } 
  if (user?.role === 'agent') {
    return <AgentDashboard />
  }
  else {
    return <ClientDashboard />
  }
}

function AppContent() {
  const { user } = useAuth()

  console.log(user)

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : user.role === "admin" ? <Navigate to="/admin-dashboard" /> : user.role === "agent" ? <Navigate to="/agent-dashboard" /> : <Navigate to="/user-dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={["admin", "agent"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute roles={["user"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ticket/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App

"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import CreateTicket from "./pages/CreateTicket"
import TicketDetail from "./pages/TicketDetail"
import AdminPanel from "./pages/AdminPanel"
import Profile from "./pages/Profile"
import "./styles/App.css"

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />

  return children
}

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
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

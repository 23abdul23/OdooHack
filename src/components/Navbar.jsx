"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import "../styles/Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/dashboard" className="navbar-brand">
          QuickDesk
        </Link>

        <div className="navbar-menu">
          <Link href="/dashboard" className="navbar-item">
            Dashboard
          </Link>
          <Link href="/create-ticket" className="navbar-item">
            Create Ticket
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="navbar-item">
              Admin Panel
            </Link>
          )}

          <div className="navbar-user">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
            <Link href="/profile" className="navbar-item">
              Profile
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

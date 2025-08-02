"use client"
import React from "react"
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

  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Helper to get first name
  const getFirstName = (name) => name?.split(" ")[0] || ""

  // Default person icon component
  const DefaultProfileIcon = () => (
    <svg className="profile-pic default-profile-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )

  // Don't render navbar if user is not logged in
  if (!user) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href={user?.role === "admin" ? "/admin-dashboard" : "/client-dashboard"} className="navbar-brand">
          QuickDesk
        </Link>
        <div className="navbar-menu">
          <Link href={user?.role === "admin" ? "/admin-dashboard" : "/client-dashboard"} className="navbar-item">
            Dashboard
          </Link>
          {user?.role !== "admin" && (
            <Link href="/create-ticket" className="navbar-item">
              Create Ticket
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin-panel" className="navbar-item">
              Admin Panel
            </Link>
          )}

          <div className="navbar-profile" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="profile-name">{getFirstName(user?.name)}</span>
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="profile-pic" />
              ) : (
                <DefaultProfileIcon />
              )}
            </button>
            {dropdownOpen && (
              <div className="profile-dropdown improved-dropdown">
                <div className="dropdown-header">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="dropdown-profile-pic" />
                  ) : (
                    <svg className="dropdown-profile-pic default-profile-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                  <div>
                    <div className="dropdown-name">{user?.name}</div>
                    <div className="dropdown-role">{user?.role}</div>
                  </div>
                </div>
                <Link href="/profile" className="dropdown-item">
                  User Settings
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

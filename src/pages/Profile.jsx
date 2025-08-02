"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import "../styles/Profile.css"

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement profile update API call
    console.log("Profile update:", formData)
    setIsEditing(false)
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-admin"
      case "agent":
        return "role-agent"
      case "user":
        return "role-user"
      default:
        return ""
    }
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <h1>Profile</h1>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>{user?.role}</span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{user?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Role:</span>
                <span className="value">{user?.role}</span>
              </div>

              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

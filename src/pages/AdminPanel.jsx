"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminPanel.css"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [upgradeRequests, setUpgradeRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#007bff",
  })

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "categories") {
      fetchCategories()
    } else if (activeTab === "upgrades") {
      fetchUpgradeRequests()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/users",
        { headers: { Authorization: `Bearer ${token}` } })
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/categories",
        { headers: { Authorization: `Bearer ${token}` } })
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpgradeRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/upgrade-requests",
        { headers: { Authorization: `Bearer ${token}` } })
      setUpgradeRequests(response.data)
    } catch (error) {
      console.error("Error fetching upgrade requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(`http://localhost:5000/api/users/${userId}/role`, { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        const token = localStorage.getItem("token")
        await axios.patch(`http://localhost:5000/api/users/${userId}/deactivate`, {},
          { headers: { Authorization: `Bearer ${token}` } })
        setUsers(users.filter((user) => user._id !== userId))
      } catch (error) {
        console.error("Error deactivating user:", error)
      }
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post("http://localhost:5000/api/categories", newCategory,
        { headers: { Authorization: `Bearer ${token}` } })
      setCategories([...categories, response.data])
      setNewCategory({ name: "", description: "", color: "#007bff" })
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`,
          { headers: { Authorization: `Bearer ${token}` } })
        setCategories(categories.filter((cat) => cat._id !== categoryId))
      } catch (error) {
        console.error("Error deleting category:", error)
      }
    }
  }

  const handleUpgradeRequest = async (requestId, action, adminNotes = "") => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`http://localhost:5000/api/upgrade-requests/${requestId}`, 
        { status: action, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } })
      
      // Update the request in the local state
      setUpgradeRequests(upgradeRequests.map(req => 
        req._id === requestId ? { ...req, status: action, adminNotes } : req
      ))
      
      alert(`Request ${action} successfully!`)
    } catch (error) {
      console.error("Error updating upgrade request:", error)
      alert("Failed to update request. Please try again.")
    }
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
          User Management
        </button>
        <button className={activeTab === "categories" ? "active" : ""} onClick={() => setActiveTab("categories")}>
          Category Management
        </button>
        <button className={activeTab === "upgrades" ? "active" : ""} onClick={() => setActiveTab("upgrades")}>
          Upgrade Requests
        </button>
      </div>

      {activeTab === "users" && (
        <div className="users-section">
          <h2>User Management</h2>
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDeactivateUser(user._id)} className="deactivate-btn">
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="categories-section">
          <h2>Category Management</h2>

          <form onSubmit={handleCreateCategory} className="category-form">
            <h3>Create New Category</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows="3"
            />
            <button type="submit">Create Category</button>
          </form>

          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : (
            <div className="categories-list">
              {categories.map((category) => (
                <div key={category._id} className="category-item">
                  <div className="category-info">
                    <div className="category-color" style={{ backgroundColor: category.color }}></div>
                    <div className="category-details">
                      <h4>{category.name}</h4>
                      <p>{category.description}</p>
                      <small>Created by {category.createdBy?.name}</small>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCategory(category._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "upgrades" && (
        <div className="upgrades-section">
          <h2>Upgrade Requests</h2>
          {loading ? (
            <div className="loading">Loading upgrade requests...</div>
          ) : (
            <div className="upgrade-requests-container">
              {upgradeRequests.length === 0 ? (
                <div className="no-requests">
                  <div className="no-requests-icon">
                    📧
                  </div>
                  <h3>No upgrade requests</h3>
                  <p>There are currently no pending upgrade requests to review.</p>
                </div>
              ) : (
                upgradeRequests.map((request) => (
                  <div key={request._id} className={`upgrade-request-card ${request.status}`}>
                    <div className="request-header">
                      <div className="request-sender">
                        <div className="sender-avatar">
                          {request.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="sender-info">
                          <h4>{request.userName}</h4>
                          <p>{request.userEmail}</p>
                          <span className="request-date">
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="request-status-badge">
                        <span className={`status-indicator ${request.status}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="request-subject">
                      <h3>
                        <span className="upgrade-arrow">⬆️</span>
                        Role Upgrade Request: {request.currentRole} → {request.requestedRole}
                      </h3>
                    </div>

                    <div className="request-body">
                      <div className="request-details">
                        <div className="detail-row">
                          <strong>Current Role:</strong>
                          <span className={`role-badge ${request.currentRole}`}>
                            {request.currentRole}
                          </span>
                        </div>
                        <div className="detail-row">
                          <strong>Requested Role:</strong>
                          <span className={`role-badge ${request.requestedRole}`}>
                            {request.requestedRole}
                          </span>
                        </div>
                      </div>

                      <div className="request-reason">
                        <h4>📝 Reason for Upgrade:</h4>
                        <div className="reason-text">
                          {request.reason}
                        </div>
                      </div>

                      {request.adminNotes && (
                        <div className="admin-notes">
                          <h4>🔖 Admin Notes:</h4>
                          <div className="notes-text">
                            {request.adminNotes}
                          </div>
                        </div>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="request-actions">
                        <button 
                          onClick={() => {
                            const notes = prompt("Add admin notes (optional):");
                            handleUpgradeRequest(request._id, "approved", notes || "");
                          }}
                          className="approve-btn"
                        >
                          ✅ Approve Request
                        </button>
                        <button 
                          onClick={() => {
                            const notes = prompt("Add rejection reason:");
                            if (notes) {
                              handleUpgradeRequest(request._id, "rejected", notes);
                            }
                          }}
                          className="reject-btn"
                        >
                          ❌ Reject Request
                        </button>
                      </div>
                    )}

                    {request.status !== "pending" && (
                      <div className="request-footer">
                        <span className="review-info">
                          {request.status === "approved" ? "✅" : "❌"} 
                          {request.status === "approved" ? "Approved" : "Rejected"} 
                          {request.reviewedAt && ` on ${new Date(request.reviewedAt).toLocaleDateString()}`}
                          {request.reviewedBy && ` by ${request.reviewedBy.name}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel

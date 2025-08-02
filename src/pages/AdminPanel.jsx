"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminPanel.css"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
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
    </div>
  )
}

export default AdminPanel

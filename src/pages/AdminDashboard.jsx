"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import TicketCard from "../components/TicketCard"
import FilterBar from "../components/FilterBar"
import Pagination from "../components/Pagination"

const AdminDashboard = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Authentication guard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }
      if (user.role !== "admin" && user.role !== "agent") {
        router.push("/client-dashboard")
        return
      }
    }
  }, [user, loading, router])
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#007bff"
  })
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
    myTickets: user?.role === "user" ? "true" : "false",
  })
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Show loading while checking authentication
  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  // Don't render anything if user is not authenticated or authorized
  if (!user || (user.role !== "admin" && user.role !== "agent")) {
    return null
  }

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [filters, pagination.currentPage, hasActiveFilters])

  // Initialize hasActiveFilters on mount
  useEffect(() => {
    const initialFilters = filters.status || 
                          filters.category || 
                          filters.priority || 
                          filters.search ||
                          (user?.role !== "user" && filters.myTickets === "true")
    setHasActiveFilters(initialFilters)
  }, [])

  const fetchTickets = async () => {
    try {
      setDashboardLoading(true)
      
      // Check if any filters are actively being used
      const activeFilters = hasActiveFilters && (
        filters.status || 
        filters.category || 
        filters.priority || 
        filters.search ||
        (user?.role !== "user" && filters.myTickets === "true")
      )

      let params
      
      if (activeFilters) {
        // Use filters when they are actively applied
        params = new URLSearchParams({
          page: pagination.currentPage,
          limit: 10,
          ...filters,
        })
      } else {
        // Default: show 40 most recent tickets without filters
        params = new URLSearchParams({
          page: pagination.currentPage,
          limit: 40,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      }

      const response = await api.get(`/tickets?${params}`)
      setTickets(response.data.tickets)
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      })
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    
    // Check if any filters are being applied
    const hasFilters = newFilters.status || 
                      newFilters.category || 
                      newFilters.priority || 
                      newFilters.search ||
                      (user?.role !== "user" && newFilters.myTickets === "true")
    
    setHasActiveFilters(hasFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "",
      category: "",
      priority: "",
      search: "",
      myTickets: user?.role === "user" ? "true" : "false",
    }
    setFilters(clearedFilters)
    setHasActiveFilters(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post("/categories", newCategory)
      setCategories([...categories, response.data])
      setNewCategory({ name: "", description: "", color: "#007bff" })
      setShowCreateCategory(false)
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`)
      setCategories(categories.filter(cat => cat._id !== categoryId))
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "#e74c3c"
      case "in-progress": return "#f39c12"
      case "resolved": return "#27ae60"
      default: return "#3498db"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Manage tickets and categories efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Categories</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tickets"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>Tickets Management</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Ticket Statistics Overview */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">QuickDesk Ticket Analytics</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tickets */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-100">
                            Total Tickets {hasActiveFilters && "(Filtered)"}
                          </p>
                          <p className="text-2xl font-bold">{pagination.total}</p>
                        </div>
                      </div>
                    </div>

                    {/* Open Tickets */}
                    <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-100">
                            Open Tickets {hasActiveFilters && "(Filtered)"}
                          </p>
                          <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "open").length}</p>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Tickets */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-100">
                            In Progress {hasActiveFilters && "(Filtered)"}
                          </p>
                          <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "in-progress").length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resolved Tickets */}
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-100">
                            Resolved {hasActiveFilters && "(Filtered)"}
                          </p>
                          <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "resolved").length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Ticket Activity</h3>
                  <div className="space-y-3">
                    {tickets.slice(0, 4).map((ticket, index) => (
                      <div key={ticket._id} className={`flex items-center p-3 rounded-lg ${
                        ticket.status === 'open' ? 'bg-red-50' :
                        ticket.status === 'in-progress' ? 'bg-yellow-50' :
                        ticket.status === 'resolved' ? 'bg-green-50' : 'bg-blue-50'
                      }`}>
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${
                            ticket.status === 'open' ? 'bg-red-400' :
                            ticket.status === 'in-progress' ? 'bg-yellow-400' :
                            ticket.status === 'resolved' ? 'bg-green-400' : 'bg-blue-400'
                          }`}></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">{ticket.subject}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.status === 'resolved' ? 'Resolved' : 
                             ticket.status === 'in-progress' ? 'In progress' : 'New ticket'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Create Category Form */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Category</h3>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="border border-gray-300 rounded-md h-10 w-20 cursor-pointer"
                      />
                    </div>
                    <textarea
                      placeholder="Description (optional)"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Create Category
                    </button>
                  </form>
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Existing Categories ({categories.length})
                  </h2>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading categories...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-500">{category.description || "No description"}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <small className="text-xs text-gray-400">
                                  Created by {category.createdBy?.name || "Admin"}
                                </small>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  category.isActive 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {category.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tickets Management Tab */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              {/* Filter Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Tickets Management</h2>
                    <div className="flex items-center space-x-4">
                      {hasActiveFilters ? (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔍 Filtered Results
                          </span>
                          <button 
                            onClick={clearAllFilters} 
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 italic">Showing 40 most recent tickets</span>
                      )}
                    </div>
                  </div>
                  
                  <FilterBar 
                    filters={filters} 
                    categories={categories} 
                    onFilterChange={handleFilterChange} 
                    userRole={user?.role} 
                  />
                </div>
              </div>

              {/* Tickets List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading tickets...</span>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                      <p className="text-gray-500 mb-4">
                        {hasActiveFilters ? "No tickets match your current filters." : "No tickets have been created yet."}
                      </p>
                      {hasActiveFilters && (
                        <button 
                          onClick={clearAllFilters} 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {tickets.map((ticket) => (
                          <TicketCard key={ticket._id} ticket={ticket} />
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Pagination
                          currentPage={pagination.currentPage}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import TicketCard from "../components/TicketCard"
import FilterBar from "../components/FilterBar"
import Pagination from "../components/Pagination"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
    myTickets: user?.role === "user" ? "true" : "false",
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [filters, pagination.currentPage])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters,
      })

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
      setLoading(false)
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
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link href="/create-ticket" className="create-ticket-btn">
          Create New Ticket
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <span className="stat-number">{pagination.total}</span>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <span className="stat-number">{tickets.filter((t) => t.status === "open").length}</span>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <span className="stat-number">{tickets.filter((t) => t.status === "in-progress").length}</span>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <span className="stat-number">{tickets.filter((t) => t.status === "resolved").length}</span>
        </div>
      </div>

      <FilterBar filters={filters} categories={categories} onFilterChange={handleFilterChange} userRole={user?.role} />

      <div className="tickets-section">
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets found.</p>
            <Link href="/create-ticket" className="create-ticket-btn">
              Create your first ticket
            </Link>
          </div>
        ) : (
          <>
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard

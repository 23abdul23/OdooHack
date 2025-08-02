"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import TicketCard from "../components/TicketCard"
import "../styles/ClientDashboard.css"

const ClientDashboard = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    inProgressTickets: 0
  })

  useEffect(() => {
    fetchUserTickets()
  }, [])

  useEffect(() => {
    if (tickets.length >= 0) {
      fetchUserStats()
    }
  }, [tickets])

  const fetchUserTickets = async () => {
    try {
      setLoading(true)
      // The backend automatically filters to user's tickets when role is 'user'
      const response = await api.get("/tickets", {
        params: {
          myTickets: true,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc"
        }
      })
      setTickets(response.data.tickets || [])
    } catch (error) {
      console.error("Error fetching user tickets:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await api.get(`/tickets/user/${user.id}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching user stats:", error)
      // Calculate stats from tickets if API doesn't exist
      if (tickets.length > 0) {
        const totalTickets = tickets.length
        const openTickets = tickets.filter(t => t.status === 'open').length
        const closedTickets = tickets.filter(t => t.status === 'closed').length
        const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length
        
        setStats({
          totalTickets,
          openTickets,
          closedTickets,
          inProgressTickets
        })
      }
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      
      // Search in user's tickets
      const filteredTickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.category && ticket.category.name && ticket.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      setSearchResults(filteredTickets)
    } catch (error) {
      console.error("Error searching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444'
      case 'in-progress': return '#f59e0b'
      case 'closed': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': 
        return (
          <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'in-progress':
        return (
          <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'closed':
        return (
          <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="client-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="user-avatar">
            <svg className="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name || user?.email}!</h1>
            <p>Manage your support tickets and get help when you need it</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
            <div className="stat-content">
              {getStatusIcon('open')}
              <div className="stat-text">
                <span className="stat-number">{stats.openTickets}</span>
                <span className="stat-label">Open</span>
              </div>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="stat-content">
              {getStatusIcon('in-progress')}
              <div className="stat-text">
                <span className="stat-number">{stats.inProgressTickets}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-content">
              {getStatusIcon('closed')}
              <div className="stat-text">
                <span className="stat-number">{stats.closedTickets}</span>
                <span className="stat-label">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-header">
          <h2>Search Your Tickets</h2>
          <p>Find your previous tickets or create a new one if you can't find what you're looking for</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by subject, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="clear-search">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? (
              <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {hasSearched ? (
          <div className="search-results">
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">
                {searchResults.length} ticket{searchResults.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="tickets-grid">
                {searchResults.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>No tickets found</h3>
                <p>We couldn't find any tickets matching your search. Try a different search term or create a new ticket.</p>
                <button 
                  onClick={() => router.push("/create-ticket")}
                  className="create-ticket-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Ticket
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="recent-tickets">
            <div className="recent-header">
              <h3>Your Recent Tickets</h3>
              <button 
                onClick={() => router.push("/create-ticket")}
                className="create-ticket-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Ticket
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p>Loading your tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="tickets-grid">
                {tickets.slice(0, 6).map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="no-tickets">
                <div className="no-tickets-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3>No tickets yet</h3>
                <p>You haven't created any support tickets yet. Create your first ticket to get started.</p>
                <button 
                  onClick={() => router.push("/create-ticket")}
                  className="create-ticket-btn primary"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import TicketCard from "../components/TicketCard"
import "../styles/ClientDashboard.css"

const AgentDashboard = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [closedTickets, setClosedTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchClosedTickets()
  }, [])

  const fetchClosedTickets = async () => {
    try {
      setLoading(true)
      // Fetch only closed tickets for the user
      const response = await api.get("/tickets", {
        params: {
          myTickets: true,
          status: "closed",
          limit: 50,
          sortBy: "updatedAt",
          sortOrder: "desc"
        }
      })
      setClosedTickets(response.data.tickets || [])
    } catch (error) {
      console.error("Error fetching closed tickets:", error)
      setClosedTickets([])
    } finally {
      setLoading(false)
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
      
      // Search in closed tickets
      const filteredTickets = closedTickets.filter(ticket => 
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
            <p>Search your closed tickets or create a new support request</p>
          </div>
        </div>
        
        {/* Create Ticket Button */}
        <div className="header-actions">
          <button 
            onClick={() => router.push("/create-ticket")}
            className="create-ticket-btn primary"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Ticket
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-header">
          <h2>Have a Query ?</h2>
          <p>Look through your previously closed support tickets to find solutions</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search your closed tickets by subject, description, or category..."
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
          <div className="search-results">
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">
                {searchResults.length} closed ticket{searchResults.length !== 1 ? 's' : ''} found
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
                <h3>No closed tickets found</h3>
                <p>We couldn't find any closed tickets matching your search. Try a different search term or create a new ticket for your issue.</p>
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
      </div>
    </div>
  )
}

export default AgentDashboard

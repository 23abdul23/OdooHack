"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import CommentSection from "../components/CommentSection"
import "../styles/TicketDetail.css"

const TicketDetail = () => {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userVote, setUserVote] = useState(null)

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/tickets/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } })
      setTicket(response.data)

      // Check user's vote
      if (response.data.upvotes.includes(user.id)) {
        setUserVote("up")
      } else if (response.data.downvotes.includes(user.id)) {
        setUserVote("down")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(`http://localhost:5000/api/tickets/${params.id}/status`, { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } })
      setTicket((prev) => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleVote = async (type) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`http://localhost:5000/api/tickets/${params.id}/vote`, { type },
        { headers: { Authorization: `Bearer ${token}` } })
      setTicket((prev) => ({
        ...prev,
        upvotes: { length: response.data.upvotes },
        downvotes: { length: response.data.downvotes },
      }))
      setUserVote(response.data.userVote)
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "status-open"
      case "in-progress":
        return "status-progress"
      case "resolved":
        return "status-resolved"
      case "closed":
        return "status-closed"
      default:
        return ""
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "low":
        return "priority-low"
      case "medium":
        return "priority-medium"
      case "high":
        return "priority-high"
      case "urgent":
        return "priority-urgent"
      default:
        return ""
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) return <div className="loading">Loading ticket...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!ticket) return <div className="error-message">Ticket not found</div>

  return (
    <div className="ticket-detail">
      <div className="ticket-header">
        <button onClick={() => router.push("/dashboard")} className="back-btn">
          ← Back to Dashboard
        </button>

        <div className="ticket-title-section">
          <h1>
            #{ticket.ticketNumber}: {ticket.subject}
          </h1>
          <div className="ticket-meta">
            <span className={`status-badge ${getStatusClass(ticket.status)}`}>{ticket.status.replace("-", " ")}</span>
            <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span>
            <span className="category-badge" style={{ backgroundColor: ticket.category.color }}>
              {ticket.category.name}
            </span>
          </div>
        </div>

        {(user.role === "agent" || user.role === "admin") && (
          <div className="status-controls">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      <div className="ticket-content">
        <div className="ticket-info">
          <div className="info-row">
            <span className="label">Created by:</span>
            <span className="value">
              {ticket.createdBy.name} ({ticket.createdBy.email})
            </span>
          </div>
          <div className="info-row">
            <span className="label">Created on:</span>
            <span className="value">{formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.assignedTo && (
            <div className="info-row">
              <span className="label">Assigned to:</span>
              <span className="value">
                {ticket.assignedTo.name} ({ticket.assignedTo.email})
              </span>
            </div>
          )}
          {ticket.resolvedAt && (
            <div className="info-row">
              <span className="label">Resolved on:</span>
              <span className="value">{formatDate(ticket.resolvedAt)}</span>
            </div>
          )}
        </div>

        <div className="ticket-description">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="ticket-attachments">
            <h3>Attachments</h3>
            <div className="attachments-list">
              {ticket.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <a
                    href={`http://localhost:5000/${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
                    📎 {attachment.originalName}
                  </a>
                  <span className="attachment-size">({(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ticket-votes">
          <button onClick={() => handleVote("up")} className={`vote-btn upvote ${userVote === "up" ? "active" : ""}`}>
            👍 {ticket.upvotes?.length || 0}
          </button>
          <button
            onClick={() => handleVote("down")}
            className={`vote-btn downvote ${userVote === "down" ? "active" : ""}`}
          >
            👎 {ticket.downvotes?.length || 0}
          </button>
        </div>
      </div>

      <CommentSection ticketId={ticket._id} comments={ticket.comments} onCommentAdded={fetchTicket} />
    </div>
  )
}

export default TicketDetail

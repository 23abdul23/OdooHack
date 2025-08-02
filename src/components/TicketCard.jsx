import Link from "next/link"
import "../styles/TicketCard.css"

const TicketCard = ({ ticket }) => {
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <div className="ticket-number">#{ticket.ticketNumber}</div>
        <div className={`ticket-status ${getStatusClass(ticket.status)}`}>{ticket.status.replace("-", " ")}</div>
      </div>

      <div className="ticket-content">
        <h3 className="ticket-subject">
          <Link href={`/ticket/${ticket._id}`}>{ticket.subject}</Link>
        </h3>

        <p className="ticket-description">
          {ticket.description.length > 100 ? `${ticket.description.substring(0, 100)}...` : ticket.description}
        </p>

        <div className="ticket-meta">
          <div className="ticket-category" style={{ backgroundColor: ticket.category.color }}>
            {ticket.category.name}
          </div>
          <div className={`ticket-priority ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</div>
        </div>

        <div className="ticket-footer">
          <div className="ticket-author">Created by {ticket.createdBy.name}</div>
          <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
        </div>

        {ticket.assignedTo && <div className="ticket-assigned">Assigned to: {ticket.assignedTo.name}</div>}

        <div className="ticket-votes">
          <span className="upvotes">👍 {ticket.upvotes?.length || 0}</span>
          <span className="downvotes">👎 {ticket.downvotes?.length || 0}</span>
          <span className="comments">💬 {ticket.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default TicketCard

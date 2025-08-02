"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "../styles/CommentSection.css"

const CommentSection = ({ ticketId, comments, onCommentAdded }) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("message", newComment)

      files.forEach((file) => {
        formData.append("attachments", file)
      })

      await api.post(`/tickets/${ticketId}/comments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setNewComment("")
      setFiles([])
      onCommentAdded()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setLoading(false)
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
    <div className="comment-section">
      <h3>Comments ({comments?.length || 0})</h3>

      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.user.name}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
                {comment.isInternal && <span className="internal-badge">Internal</span>}
              </div>
              <div className="comment-content">
                <p>{comment.message}</p>
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="comment-attachments">
                    {comment.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={`http://localhost:5000/${attachment.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        📎 {attachment.originalName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-comments">No comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          />
        </div>

        <button type="submit" disabled={loading || !newComment.trim()}>
          {loading ? "Adding..." : "Add Comment"}
        </button>
      </form>
    </div>
  )
}

export default CommentSection

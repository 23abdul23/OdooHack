"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles/CreateTicket.css"

const   CreateTicket = () => {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
  })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      
      const response = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(response.data)
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submitData = new FormData()
      submitData.append("subject", formData.subject)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("priority", formData.priority)

      files.forEach((file) => {
        submitData.append("attachments", file)
      })


      const token = localStorage.getItem("token")
      
      console.log("Data : ",formData)
      const response = await axios.post(
        "http://localhost:5000/api/tickets",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      router.push(`/ticket/${response.data._id}`)
    } catch (error) {
      setError(error.response?.data?.message || "Error creating ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-ticket">
      <div className="create-ticket-container">
        <div className="header-section">
          <div className="title-row">
            <div className="icon-wrapper">
              <svg className="ticket-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1>Create New Ticket</h1>
          </div>
          <p className="subtitle">Submit your issue and get expert support</p>
        </div>

        {error && (
          <div className="error-message">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-section">
            <h3 className="section-title">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
              </svg>
              Basic Information
            </h3>
            
            <div className="form-group">
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Brief description of your issue"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Category & Priority
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  required
                  className="form-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <select 
                  id="priority" 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleInputChange}
                  className={`form-select priority-${formData.priority}`}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </h3>
            
            <div className="form-group">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Detailed description of your issue"
                className="form-textarea"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attachments
            </h3>
            
            <div className="form-group">
              <div className="file-upload-area">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                  className="file-input"
                />
                <label htmlFor="attachments" className="file-upload-label">
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Click to upload files or drag and drop</span>
                </label>
              </div>
              <small className="file-help">
                📎 You can upload up to 5 files (max 10MB each). Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
              </small>
              {files.length > 0 && (
                <div className="selected-files">
                  <h4>
                    <svg className="files-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Selected Files ({files.length})
                  </h4>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index}>
                        <div className="file-item">
                          <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.push("/dashboard")} className="cancel-btn">
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <svg className="button-icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTicket

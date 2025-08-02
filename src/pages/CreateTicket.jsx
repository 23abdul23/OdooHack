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
      const response = await axios.post(
        "http://localhost:5000/api/tickets",
        submitData,
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
        <h1>Create New Ticket</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="form-row">
            {/* <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="furniture">Furniture</option>
                <option value="sports">Sports</option>
              </select>
            </div>



            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="6"
              placeholder="Detailed description of your issue"
            />
          </div>

          <div className="form-group">
            <label htmlFor="attachments">Attachments</label>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            <small className="file-help">
              You can upload up to 5 files (max 10MB each). Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
            </small>
            {files.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files:</h4>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.push("/dashboard")} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTicket

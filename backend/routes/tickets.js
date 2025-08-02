const express = require("express")
const multer = require("multer")
const path = require("path")
const { body, validationResult } = require("express-validator")
const Ticket = require("../models/Ticket")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Create ticket
router.post(
  "/",
  auth,
  upload.array("attachments", 5),
  [
    body("subject").trim().isLength({ min: 5 }).withMessage("Subject must be at least 5 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("category").isString().withMessage("Valid category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { subject, description, category, priority } = req.body

      const attachments = req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
          }))
        : []

      const similiarTicket = await axios.post("http://127.0.0.1:8000/ticet", req.body)
      
      
      const ticket = new Ticket({
        subject,
        description,
        category,
        priority: priority || "medium",
        createdBy: req.user._id,
        attachments,
      })

      await ticket.save()
      await ticket.populate(["category", "createdBy"], "name email")

      res.status(201).json(ticket)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get tickets with filtering and pagination
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      myTickets,
    } = req.query

    const query = {}

    // Filter by user's own tickets if requested or if user is not agent/admin
    if (myTickets === "true" || req.user.role === "user") {
      query.createdBy = req.user._id
    }

    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketNumber: { $regex: search, $options: "i" } },
      ]
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const tickets = await Ticket.find(query)
      .populate("category", "name color")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Ticket.countDocuments(query)

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single ticket
router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("category", "name color")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check if user can view this ticket
    if (req.user.role === "user" && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(ticket)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update ticket status (agents and admins only)
router.patch("/:id/status", auth, authorize("agent", "admin"), async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["open", "in-progress", "resolved", "closed"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updateData = { status }
    if (status === "resolved") updateData.resolvedAt = new Date()
    if (status === "closed") updateData.closedAt = new Date()

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate(
      ["category", "createdBy", "assignedTo"],
      "name email color",
    )

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    res.json(ticket)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add comment to ticket
router.post(
  "/:id/comments",
  auth,
  upload.array("attachments", 3),
  [body("message").trim().isLength({ min: 1 }).withMessage("Message is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const ticket = await Ticket.findById(req.params.id)
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" })
      }

      // Check if user can comment on this ticket
      if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      const attachments = req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
          }))
        : []

      const comment = {
        user: req.user._id,
        message: req.body.message,
        isInternal: req.body.isInternal === "true",
        attachments,
      }

      ticket.comments.push(comment)
      await ticket.save()
      await ticket.populate("comments.user", "name email")

      res.json(ticket.comments[ticket.comments.length - 1])
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Vote on ticket
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { type } = req.body // 'up' or 'down'
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    const userId = req.user._id

    // Remove existing votes
    ticket.upvotes = ticket.upvotes.filter((id) => id.toString() !== userId.toString())
    ticket.downvotes = ticket.downvotes.filter((id) => id.toString() !== userId.toString())

    // Add new vote
    if (type === "up") {
      ticket.upvotes.push(userId)
    } else if (type === "down") {
      ticket.downvotes.push(userId)
    }

    await ticket.save()

    res.json({
      upvotes: ticket.upvotes.length,
      downvotes: ticket.downvotes.length,
      userVote: type,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

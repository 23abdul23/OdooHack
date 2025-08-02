const express = require("express")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all users (admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user role (admin only)
router.patch("/:id/role", auth, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body
    const validRoles = ["user", "agent", "admin"]

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Deactivate user (admin only)
router.patch("/:id/deactivate", auth, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deactivated successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

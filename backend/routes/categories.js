const express = require("express")
const { body, validationResult } = require("express-validator")
const Category = require("../models/Category")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate("createdBy", "name").sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create category (admin only)
router.post(
  "/",
  auth,
  authorize("admin"),
  [body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color } = req.body

      const existingCategory = await Category.findOne({ name })
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" })
      }

      const category = new Category({
        name,
        description,
        color: color || "#007bff",
        createdBy: req.user._id,
      })

      await category.save()
      await category.populate("createdBy", "name")

      res.status(201).json(category)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update category (admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [body("name").trim().isLength({ min: 2 }).withMessage("Category name must be at least 2 characters")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color, isActive } = req.body

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description, color, isActive },
        { new: true },
      ).populate("createdBy", "name")

      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      res.json(category)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete category (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

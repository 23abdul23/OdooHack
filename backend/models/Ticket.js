const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
)

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
    comments: [commentSchema],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [String],
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Generate ticket number before saving
ticketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model("Ticket").countDocuments()
    this.ticketNumber = `QD-${String(count + 1).padStart(6, "0")}`
  }
  next()
})

module.exports = mongoose.model("Ticket", ticketSchema)

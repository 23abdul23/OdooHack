const mongoose = require('mongoose')

const upgradeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  currentRole: {
    type: String,
    required: true,
    enum: ['user', 'agent', 'admin']
  },
  requestedRole: {
    type: String,
    required: true,
    enum: ['agent', 'admin']
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('UpgradeRequest', upgradeRequestSchema)

const express = require('express')
const router = express.Router()
const UpgradeRequest = require('../models/UpgradeRequest')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

// Create upgrade request
router.post('/', auth, async (req, res) => {
  try {
    const { currentRole, requestedRole, reason } = req.body

    // Check if user already has a pending request
    const existingRequest = await UpgradeRequest.findOne({
      userId: req.user._id,
      status: 'pending'
    })

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending upgrade request' })
    }

    // Get user details
    const user = req.user
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Validate upgrade path
    if (currentRole === 'admin') {
      return res.status(400).json({ message: 'Admin users cannot request upgrades' })
    }

    if (currentRole === 'user' && requestedRole !== 'agent') {
      return res.status(400).json({ message: 'Users can only request upgrade to agent role' })
    }

    if (currentRole === 'agent' && requestedRole !== 'admin') {
      return res.status(400).json({ message: 'Agents can only request upgrade to admin role' })
    }

    const upgradeRequest = new UpgradeRequest({
      userId: req.user._id,
      userName: user.name,
      userEmail: user.email,
      currentRole,
      requestedRole,
      reason
    })

    await upgradeRequest.save()

    res.status(201).json({
      message: 'Upgrade request submitted successfully',
      request: upgradeRequest
    })
  } catch (error) {
    console.error('Error creating upgrade request:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all upgrade requests (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const requests = await UpgradeRequest.find()
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error('Error fetching upgrade requests:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update upgrade request status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body

    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const upgradeRequest = await UpgradeRequest.findById(req.params.id)
    if (!upgradeRequest) {
      return res.status(404).json({ message: 'Upgrade request not found' })
    }

    upgradeRequest.status = status
    upgradeRequest.adminNotes = adminNotes || ''
    upgradeRequest.reviewedBy = req.user._id
    upgradeRequest.reviewedAt = new Date()

    await upgradeRequest.save()

    // If approved, update user role
    if (status === 'approved') {
      await User.findByIdAndUpdate(upgradeRequest.userId, {
        role: upgradeRequest.requestedRole
      })
    }

    res.json({
      message: `Upgrade request ${status} successfully`,
      request: upgradeRequest
    })
  } catch (error) {
    console.error('Error updating upgrade request:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's upgrade requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await UpgradeRequest.find({ userId: req.user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error('Error fetching user upgrade requests:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router

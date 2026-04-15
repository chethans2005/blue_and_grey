const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }), async (req, res) => {
  // req.user will contain profile from passport strategy
  const profile = req.user
  // upsert user
  const user = await User.findOneAndUpdate(
    { auth_id: profile.id },
    { auth_id: profile.id, email: profile.emails?.[0]?.value, name: profile.displayName, avatar: profile.photos?.[0]?.value },
    { upsert: true, new: true }
  )
  const token = jwt.sign({ id: user._id, auth_id: user.auth_id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' })
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
  // redirect to frontend with token
  return res.redirect(`${frontend}/?token=${token}`)
})

router.get('/failure', (req, res) => res.status(401).json({ error: 'auth failed' }))

// Return current user from JWT (set by authMiddleware)
router.get('/user', (req, res) => {
  if(!req.user) return res.status(401).json({ error: 'not authenticated' })
  return res.json({ id: req.user.id, email: req.user.email, name: req.user.name })
})

module.exports = router

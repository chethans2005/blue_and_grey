const express = require('express')
const router = express.Router()
const PostLike = require('../models/PostLike')

// Get liked post ids for current user
router.get('/', async (req, res) => {
  const user = req.user
  if(!user) return res.status(401).json({ error: 'login required' })
  const likes = await PostLike.find({ user_id: user.id }).lean()
  res.json(likes.map(l => ({ post_id: l.post_id })))
})

module.exports = router

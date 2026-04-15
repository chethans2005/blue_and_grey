const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const PostLike = require('../models/PostLike')

// list posts
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).lean()
  res.json(posts)
})

// create post (simple auth: require ADMIN env var match via header X-ADMIN)
router.post('/', async (req, res) => {
  const adminHeader = req.headers['x-admin']
  // allow admin via ADMIN_SECRET header or via authenticated admin email
  const isAdminHeader = process.env.ADMIN_SECRET && adminHeader === process.env.ADMIN_SECRET
  const isAdminUser = req.user && process.env.ADMIN_EMAIL && req.user.email === process.env.ADMIN_EMAIL
  if (!isAdminHeader && !isAdminUser) {
    return res.status(403).json({ error: 'forbidden' })
  }
  const { images, caption, hidden_message } = req.body
  const p = await Post.create({ images, caption, hiddenMessage: hidden_message })
  res.json(p)
})

router.post('/:id/like', async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id || req.body.user_id
  if (!userId) return res.status(401).json({ error: 'login required' })

  try {
    await PostLike.create({ post_id: id, user_id: userId })
    const p = await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true })
    return res.json({ ok: true, likesCount: p.likesCount })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'already liked' })
    console.error(err)
    return res.status(500).json({ error: 'server error' })
  }
})

module.exports = router

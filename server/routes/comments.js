const express = require('express')
const router = express.Router()
const Comment = require('../models/Comment')

router.get('/:postId', async (req, res) => {
  const { postId } = req.params
  const comments = await Comment.find({ post_id: postId }).sort({ createdAt: 1 }).lean()
  res.json(comments)
})

router.post('/:postId', async (req, res) => {
  const { postId } = req.params
  const user = req.user
  if(!user && !req.body.author_email) return res.status(401).json({ error: 'login required' })
  const authorName = user?.name || req.body.author_name || req.body.author_email
  const authorAvatar = user?.avatar || req.body.author_avatar || ''

  const c = await Comment.create({
    post_id: postId,
    text: req.body.text,
    author_id: user?.id,
    author_email: req.body.author_email || user?.email,
    author_name: authorName,
    author_avatar: authorAvatar
  })
  res.json(c)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const user = req.user
  // allow delete if admin secret header or author matches
  const adminHeader = req.headers['x-admin']
  if (process.env.ADMIN_SECRET && req.user?.email === process.env.ADMIN_EMAIL) {
    await Comment.findByIdAndDelete(id)
    return res.json({ ok: true })
  }
  if (!user) return res.status(401).json({ error: 'login required' })

  const comment = await Comment.findById(id)
  if (!comment) return res.status(404).json({ error: 'not found' })
  if (comment.author_id && comment.author_id === user.id) {
    await Comment.findByIdAndDelete(id)
    return res.json({ ok: true })
  }
  return res.status(403).json({ error: 'forbidden' })
})

module.exports = router

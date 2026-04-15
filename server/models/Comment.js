const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text: String,
  author_id: { type: String },
  author_email: String,
  author_name: String,
  author_avatar: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Comment', CommentSchema)

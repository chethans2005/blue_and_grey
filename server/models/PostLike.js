const mongoose = require('mongoose')

const PostLikeSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

PostLikeSchema.index({ post_id: 1, user_id: 1 }, { unique: true })

module.exports = mongoose.model('PostLike', PostLikeSchema)

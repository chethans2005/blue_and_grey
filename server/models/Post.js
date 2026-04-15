const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  images: [String],
  caption: String,
  hiddenMessage: String,
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', PostSchema)

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  auth_id: { type: String, required: true, unique: true }, // Google sub
  email: { type: String },
  name: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', UserSchema)

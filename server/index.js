require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')

const PostRoutes = require('./routes/posts')
const CommentRoutes = require('./routes/comments')
const AuthRoutes = require('./routes/auth')
const UploadRoutes = require('./routes/uploads')
const PostLikesRoutes = require('./routes/post_likes')

const User = require('./models/User')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Passport Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, function(accessToken, refreshToken, profile, cb){
  return cb(null, profile)
}))

// simple middleware to extract JWT from Authorization header or query
function authMiddleware(req, res, next){
  const auth = req.headers.authorization || req.query.token || req.headers['x-access-token']
  if(!auth) return next()
  let token = auth
  if(auth.startsWith('Bearer ')) token = auth.slice(7)
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    // attach simple user object
    req.user = { id: payload.id, email: payload.email, name: payload.name }
  }catch(e){ /* ignore */ }
  return next()
}

app.use(authMiddleware)

// routes
app.use('/api/posts', PostRoutes)
app.use('/api/comments', CommentRoutes)
app.use('/api/auth', AuthRoutes)
app.use('/api/uploads', UploadRoutes)
app.use('/api/post_likes', PostLikesRoutes)

// basic health
app.get('/api/health', (req, res) => res.json({ ok: true }))

const mongo = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rameesa'
mongoose.connect(mongo)
  .then(()=>{
    const port = process.env.PORT || 4000
    app.listen(port, ()=>console.log('Server running on', port))
  })
  .catch(err=>{
    console.error('Mongo connect failed', err)
    process.exit(1)
  })

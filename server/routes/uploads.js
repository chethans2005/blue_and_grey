const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' })

  try {
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: process.env.CLOUDINARY_FOLDER || 'rameesa/posts' }, (error, result) => {
          if (result) resolve(result)
          else reject(error)
        })
        streamifier.createReadStream(buffer).pipe(stream)
      })
    }

    const result = await streamUpload(req.file.buffer)
    return res.json({ url: result.secure_url, raw: result })
  } catch (err) {
    console.error('Cloudinary upload failed', err)
    return res.status(500).json({ error: 'upload failed' })
  }
})

module.exports = router

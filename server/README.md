# Rameesa Backend (Mongo)

Quick-start (development):

1. Copy `.env.example` to `.env` and set values.
2. Start MongoDB (local or Atlas).
3. Install and run:

```bash
cd server
npm install
npm run dev
```

The server exposes REST endpoints under `/api/*` and Google OAuth at `/api/auth/google`.

Notes:
- This is a minimal scaffold. For production, secure sessions, CORS, and storage properly.
 - Uploads: this project supports Cloudinary for image hosting. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env` (see `.env.example`).
 - The server exposes `/api/uploads` to accept multipart `file` and upload to Cloudinary; it returns `{ url }` for the uploaded image.

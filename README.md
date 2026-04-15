# Rameesa — Minimal Poetry Gallery

This is a mobile-first React (Vite) + Tailwind CSS gallery for image-based poems.

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with backend settings:

```
VITE_ADMIN_EMAILS=admin@example.com
GOOGLE_AUTH_CLIENT_ID=...
GOOGLE_AUTH_SECRET=...
# If using the bundled server: set `VITE_API_BASE` or run the server at http://localhost:4000
```

3. Start dev server:

```bash
npm run dev
```

Notes

- The studio route is at `/studio` and is protected by Google sign-in and the `VITE_ADMIN_EMAILS` list.
-- Backend server (Express + Mongo) is included under `server/`. Set up Cloudinary and Google OAuth per `server/.env.example` for full functionality.

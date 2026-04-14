# Rameesa — Minimal Poetry Gallery

This is a mobile-first React (Vite) + Tailwind CSS gallery for image-based poems.

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Firebase credentials (Vite uses `VITE_` prefix):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAILS=admin@example.com
```

3. Start dev server:

```bash
npm run dev
```

Notes

- The studio route is at `/studio` and is protected by Google sign-in and the `VITE_ADMIN_EMAILS` list.
- Firebase Auth, Firestore and Storage are required for full functionality.

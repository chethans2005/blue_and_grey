# Rameesa — Minimal Poetry Gallery

This is a mobile-first React (Vite) + Tailwind CSS gallery for image-based poems.

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Supabase credentials (Vite uses `VITE_` prefix):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_EMAILS=admin@example.com
```

3. Start dev server:

```bash
npm run dev
```

Notes

- The studio route is at `/studio` and is protected by Google sign-in and the `VITE_ADMIN_EMAILS` list.
- Supabase Auth, Database, and Storage are required for full functionality.

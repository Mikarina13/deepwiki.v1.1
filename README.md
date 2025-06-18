# deepwiki.v1.1

This project uses Vite with Supabase as the backend service.

## Setup

1. Copy `.env.example` to `.env` (`cp .env.example .env`).
2. Replace the placeholder values with your own `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
3. `.env` is listed in `.gitignore`, so your credentials stay out of version
   control.

After configuring the environment file, install dependencies and start the
development server:

```bash
npm install
npm run dev
```


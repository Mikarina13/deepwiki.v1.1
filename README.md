# DeepWiki

DeepWiki is an experiment in community‑driven knowledge sharing. It lets people post AI‑generated insights, browse ideas from others and find collaborators. By sharing results instead of recomputing them, the project aims to "share the insight, spare the energy." The front‑end is powered by [Vite](https://vitejs.dev/) while [Supabase](https://supabase.com/) provides authentication, storage and database services.

## Key Features

- **Archive** – Search and publish AI‑generated posts under the CC BY‑SA 4.0 license.
- **COLAB Lite** – Share collaboration proposals and connect with others.
- **Profiles** – Manage your personal profile and avatar stored in Supabase Storage.
- **Favorites** – Save posts you find interesting for quick access.
- **Activity & Info Hub** – Stay up to date with community activity and read documentation or help articles.

## Setup

1. **Install Dependencies** – Make sure [Node.js](https://nodejs.org/) 18 or later is available, then run:

   ```bash
   npm install
   ```

2. **Configure Environment Variables** – Create a `.env` file at the project root with your Supabase credentials:

   ```bash
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run the Development Server** – Start Vite in development mode:

   ```bash
   npm run dev
   ```

   The site will be available at the URL printed by Vite (usually `http://localhost:5173`).


## Running Tests

The project uses [Vitest](https://vitest.dev/) for unit tests. After installing dependencies run:

```bash
npm test
```

This command executes all tests inside the `tests` directory.


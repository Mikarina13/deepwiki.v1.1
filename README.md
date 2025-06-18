# DeepWiki

DeepWiki is a small experiment in community‑driven knowledge sharing. It lets people post AI‑generated insights, browse ideas from others and find collaborators. The front‑end is powered by [Vite](https://vitejs.dev/) while [Supabase](https://supabase.com/) provides authentication, storage and database services.

## Key Features

- **Archive** – Search and publish AI‑generated posts under the CC BY‑SA 4.0 license.
- **COLAB Lite** – Share collaboration proposals and connect with others.
- **Profiles** – Manage your personal profile and avatar stored in Supabase Storage.

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


## Tests

This repository currently does not include automated tests. Test files would normally live next to the code inside the `src` directory.


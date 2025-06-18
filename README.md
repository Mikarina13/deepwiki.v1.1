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

2. **Create or Connect to Supabase** – Sign up at [Supabase](https://supabase.com/) and create a new project or use an existing one. Save the project URL and anon key. If you plan to apply database migrations locally, install the Supabase CLI (`npm install -g supabase`) and link it to your project using `supabase link --project-ref <your-project-ref>`.

3. **Configure Environment Variables** – Copy `.env.example` to `.env` and replace the placeholders with your own Supabase credentials. If the keys previously committed to this repository were used, revoke them in Supabase and generate new ones:

   ```bash
   cp .env.example .env
   # then edit .env with your values
   ```

4. **Apply Database Migrations** – The SQL files inside `supabase/migrations` define the schema. Use the Supabase CLI to apply them:

   ```bash
   supabase db push
   ```

5. **Run the Development Server** – Start Vite in development mode:

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


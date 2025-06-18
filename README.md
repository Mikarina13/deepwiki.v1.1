# DeepWiki

DeepWiki is an experimental community-driven platform for sharing AI-generated insights and finding collaborators for new ideas. The project uses [Vite](https://vitejs.dev/) for building a small web front‑end and [Supabase](https://supabase.com/) for its backend services.

## Features

- **Archive** – Search and publish AI generated posts under the CC BY‑SA 4.0 license.
- **COLAB Lite** – Post collaboration ideas and connect with others.
- **Profiles** – Manage a profile including an avatar stored in Supabase Storage.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A Supabase project and credentials for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

Create a `.env` file at the project root with your Supabase details:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Installation

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The site will be available at the URL printed by Vite (usually `http://localhost:5173`).

To create a production build run:

```bash
npm run build
```

You can preview the built site locally using:

```bash
npm run preview
```

## Tests

This repository currently does not include automated tests. Test files would normally live next to the code inside the `src` directory.


# DeepWiki v1.1

This project is a small demo built with Vite and [Supabase](https://supabase.com). It requires a Supabase project in order to store data and handle authentication.

## Connecting to Supabase

1. Create a Supabase project on [supabase.com](https://supabase.com) if you do not already have one.
2. From the project dashboard, open **Settings → API** and copy the **Project URL** and **anon key**.
3. Create a `.env` file in the repository root and add the following variables:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Install the dependencies with `npm install` and start the dev server using `npm run dev`.

## Database Migrations

Schema migrations for the project are stored in the `supabase/migrations` directory. If you want to apply them to your Supabase database you will need the [Supabase CLI](https://supabase.com/docs/guides/cli). After installing the CLI, run a command such as:

```bash
supabase db push
```

This will push the SQL migrations to your project. Depending on your setup you may need to run other CLI commands (e.g. `supabase db reset`).

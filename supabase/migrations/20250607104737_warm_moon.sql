/*
  # Add embed_url column to archive_posts table

  1. Changes
    - Add `embed_url` column to `archive_posts` table
    - This will allow users to share links to their AI deep search results
    - URLs will be displayed using iframes in the frontend

  2. Security
    - Column is optional (nullable)
    - Existing RLS policies will apply to this new column
*/

-- Add embed_url column to archive_posts table
ALTER TABLE archive_posts ADD COLUMN IF NOT EXISTS embed_url text;
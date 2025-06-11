/*
  # Add view tracking to posts

  1. Changes
    - Add `views` column to `archive_posts` table
    - Add `views` column to `collab_posts` table
    - Both default to 0 and track actual view counts

  2. Notes
    - Views will be incremented when users visit the full post page
    - This provides real engagement metrics for content
*/

-- Add views column to archive_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_posts' AND column_name = 'views'
  ) THEN
    ALTER TABLE archive_posts ADD COLUMN views integer DEFAULT 0;
  END IF;
END $$;

-- Add views column to collab_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collab_posts' AND column_name = 'views'
  ) THEN
    ALTER TABLE collab_posts ADD COLUMN views integer DEFAULT 0;
  END IF;
END $$;
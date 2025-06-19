/*
  # Track download counts for archive posts

  1. Changes
    - Add `downloads` column to `archive_posts` table
      to track how many times a file is downloaded

  2. Notes
    - Defaults to 0 for existing rows
*/

-- Add downloads column to archive_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_posts' AND column_name = 'downloads'
  ) THEN
    ALTER TABLE archive_posts ADD COLUMN downloads integer DEFAULT 0;
  END IF;
END $$;

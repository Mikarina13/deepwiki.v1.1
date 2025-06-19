/*
  # Add downloads column to archive_posts table

  1. Changes
    - Add `downloads` column to `archive_posts` table
    - This tracks how many times each post has been downloaded
    - Defaults to 0 for new and existing posts

  2. Notes
    - Downloads will be incremented when users download archive content
    - Provides engagement metrics for content creators
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
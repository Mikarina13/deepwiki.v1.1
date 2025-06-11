/*
  # Add generation date to archive posts

  1. Changes
    - Add `generation_date` column to `archive_posts` table
    - This will store when the AI content was originally generated

  2. Notes
    - Column is optional (nullable) for backward compatibility
    - Uses date type to store just the date without time
*/

-- Add generation_date column to archive_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_posts' AND column_name = 'generation_date'
  ) THEN
    ALTER TABLE archive_posts ADD COLUMN generation_date date;
  END IF;
END $$;
/*
  # Add prompt privacy option to archive posts

  1. Changes
    - Add `prompt_is_public` column to `archive_posts` table
    - This allows users to keep their prompts private while still sharing the AI-generated content
    - Defaults to true for backward compatibility

  2. Security
    - Existing RLS policies will apply to this new column
    - Privacy setting is controlled by the post author
*/

-- Add prompt_is_public column to archive_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_posts' AND column_name = 'prompt_is_public'
  ) THEN
    ALTER TABLE archive_posts ADD COLUMN prompt_is_public boolean DEFAULT true;
  END IF;
END $$;
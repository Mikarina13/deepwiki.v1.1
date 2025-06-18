/*
  # Create user favorites table

  1. New Tables
    - `user_favorites`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid)
      - `post_type` (text - 'archive' or 'collab')
      - `post_title` (text - for easy display)
      - `post_data` (jsonb - store relevant post data)

  2. Security
    - Enable RLS on user_favorites table
    - Add policies for authenticated users to manage their own favorites
    
  3. Indexes
    - Add index on user_id for fast lookups
    - Add unique constraint on user_id + post_id + post_type
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('archive', 'collab')),
  post_title text NOT NULL,
  post_data jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS user_favorites_unique_idx 
ON user_favorites (user_id, post_id, post_type);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx 
ON user_favorites (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Users can read their own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

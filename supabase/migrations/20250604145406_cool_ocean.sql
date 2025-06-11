/*
  # Create Archive and Collab posts tables

  1. New Tables
    - `archive_posts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `ai_model` (text)
      - `prompt` (text)
      - `content` (text)
      - `tags` (text array)
    
    - `collab_posts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `type` (text)
      - `title` (text)
      - `description` (text)
      - `tags` (text array)
      - `contact_email` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all posts
      - Create their own posts
      - Update/delete their own posts
*/

-- Create archive_posts table
CREATE TABLE IF NOT EXISTS archive_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  ai_model text NOT NULL,
  prompt text NOT NULL,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}'
);

-- Enable RLS and create policies for archive_posts
ALTER TABLE archive_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read archive posts"
  ON archive_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create archive posts"
  ON archive_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own archive posts"
  ON archive_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archive posts"
  ON archive_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create collab_posts table
CREATE TABLE IF NOT EXISTS collab_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  contact_email text NOT NULL
);

-- Enable RLS and create policies for collab_posts
ALTER TABLE collab_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collab posts"
  ON collab_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create collab posts"
  ON collab_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collab posts"
  ON collab_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collab posts"
  ON collab_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
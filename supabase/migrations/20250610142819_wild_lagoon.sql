/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text) - user's email address
      - `raw_user_meta_data` (jsonb) - user metadata from auth
      - `created_at` (timestamp) - when user was created
      - `updated_at` (timestamp) - when user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read/update their own data

  3. Triggers
    - Auto-populate users table when auth.users is created/updated
*/

-- Create users table that mirrors auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger function to sync with auth.users
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data, NEW.created_at, NEW.updated_at)
  ON CONFLICT (id) 
  DO UPDATE SET
    email = NEW.email,
    raw_user_meta_data = NEW.raw_user_meta_data,
    updated_at = NEW.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_data();

-- Populate existing users from auth.users
INSERT INTO users (id, email, raw_user_meta_data, created_at, updated_at)
SELECT id, email, raw_user_meta_data, created_at, updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
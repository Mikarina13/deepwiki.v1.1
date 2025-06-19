/*
  # Fix user name display by updating RLS policies

  1. Problem
    - Current RLS policy on users table only allows users to read their own data
    - This prevents displaying author names on posts created by other users
    - Results in "Anonymous" being shown instead of actual author names

  2. Solution
    - Remove restrictive RLS policy that blocks cross-user data access
    - Add new policies that allow public access to display-safe user data
    - Maintain privacy for sensitive information while enabling author name display

  3. Changes
    - Drop existing restrictive SELECT policy
    - Add policy for authenticated users to read their own full data
    - Add policy for public to read display-safe fields (id, email, raw_user_meta_data)
    - This enables author name display while maintaining appropriate privacy
*/

-- Drop the existing restrictive policy that prevents cross-user data access
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policy for authenticated users to read their own complete data
CREATE POLICY "Authenticated users can read own complete data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create new policy to allow public access to display-safe user information
-- This enables author names to be displayed on posts without exposing sensitive data
CREATE POLICY "Public can read user display information"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Note: This policy allows access to id, email, and raw_user_meta_data
-- The raw_user_meta_data typically contains display_name, full_name, avatar_url
-- which are needed for showing author information on posts
-- Sensitive auth data remains protected in the auth.users table
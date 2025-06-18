/*
  # Fix authentication database policies and sync function

  1. Changes
    - Add INSERT policies for users table to allow new user creation
    - Fix sync function to properly handle user data synchronization
    - Ensure all policies use correct auth.uid() references

  2. Security
    - Allow service role to insert users during authentication
    - Allow authenticated users to manage their own data
    - Maintain RLS protection for all operations
*/

-- Add INSERT policy for service role to allow new user creation
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;
CREATE POLICY "Allow service role to insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add INSERT policy for authenticated users
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update existing policies to ensure they use auth.uid() correctly
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the sync function can properly handle user creation
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email, raw_user_meta_data, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      updated_at = EXCLUDED.updated_at;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users SET
      email = NEW.email,
      raw_user_meta_data = NEW.raw_user_meta_data,
      updated_at = NEW.updated_at
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists on auth.users table
DROP TRIGGER IF EXISTS sync_user_data ON auth.users;
CREATE TRIGGER sync_user_data
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_data();

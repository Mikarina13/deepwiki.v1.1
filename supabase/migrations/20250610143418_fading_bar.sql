/*
  # Fix foreign key relationships for user data

  1. Changes
    - Drop existing foreign key constraints that point to auth.users
    - Add new foreign key constraints pointing to public.users
    - This ensures PostgREST can properly resolve the relationship for queries

  2. Tables affected
    - `archive_posts` - foreign key user_id now points to public.users(id)
    - `collab_posts` - foreign key user_id now points to public.users(id)

  3. Notes
    - The public.users table is already synced with auth.users via trigger
    - This allows the frontend queries to work properly with the expected relationships
*/

-- Drop existing foreign key constraints that point to auth.users
ALTER TABLE IF EXISTS public.archive_posts 
DROP CONSTRAINT IF EXISTS archive_posts_user_id_fkey;

ALTER TABLE IF EXISTS public.collab_posts 
DROP CONSTRAINT IF EXISTS collab_posts_user_id_fkey;

-- Add new foreign key constraints pointing to public.users
ALTER TABLE public.archive_posts 
ADD CONSTRAINT archive_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.collab_posts 
ADD CONSTRAINT collab_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);
/*
  # Create avatars storage bucket

  1. New Storage Bucket
    - `avatars` bucket for storing user profile pictures
    - Public access for reading avatar images
    - Authenticated users can upload their own avatars

  2. Security
    - RLS policies for avatar uploads
    - Users can only upload/update their own avatars
    - Public read access for displaying avatars
*/

-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

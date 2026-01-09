-- Fix 1: Remove overly permissive profiles policy
DROP POLICY IF EXISTS "All authenticated users can view Profile" ON public.profiles;

-- Fix 2: Make job-order-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'job-order-images';

-- Drop the overly permissive storage policy
DROP POLICY IF EXISTS "Anyone can view job order images" ON storage.objects;

-- Create policy requiring authentication for viewing job images
CREATE POLICY "Authenticated users view job images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'job-order-images'
    AND auth.role() = 'authenticated'
  );
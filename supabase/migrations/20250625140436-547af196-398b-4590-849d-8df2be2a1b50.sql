
-- Create storage bucket for job order images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-order-images',
  'job-order-images', 
  true,
  153600, -- 150KB in bytes
  ARRAY['image/jpeg', 'image/png']::text[]
);

-- Create storage policies for job order images
CREATE POLICY "Anyone can view job order images"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-order-images');

CREATE POLICY "Authenticated users can upload job order images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-order-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own job order images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'job-order-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own job order images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-order-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update job_order_attachments table to better support images
ALTER TABLE job_order_attachments 
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS is_image boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_width integer,
ADD COLUMN IF NOT EXISTS image_height integer,
ADD COLUMN IF NOT EXISTS alt_text text;

-- Update existing records to set is_image flag
UPDATE job_order_attachments 
SET is_image = true, 
    file_type = CASE 
      WHEN LOWER(file_name) LIKE '%.jpg' OR LOWER(file_name) LIKE '%.jpeg' THEN 'image/jpeg'
      WHEN LOWER(file_name) LIKE '%.png' THEN 'image/png'
      ELSE NULL
    END
WHERE LOWER(file_name) LIKE '%.jpg' 
   OR LOWER(file_name) LIKE '%.jpeg' 
   OR LOWER(file_name) LIKE '%.png';

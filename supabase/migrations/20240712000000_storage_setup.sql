-- Create a public bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_images', 'property_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to property_images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'property_images' );

-- Allow authenticated users (owners) to upload images
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' AND bucket_id = 'property_images' );

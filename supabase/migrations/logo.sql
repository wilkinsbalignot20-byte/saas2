-- 0. Siguraduhing may bucket na ang 'logos' bago mag-upload ng files
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Payagan ang authenticated users na mag-upload ng image objects sa 'logos' bucket
CREATE POLICY "Allow authenticated merchant logo uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- 2. Payagan ang kahit sino na makita ang uploaded logos para gumana ang storefront layouts
CREATE POLICY "Allow public read access to merchant logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

 -- 🚨 HAKBANG A: BURAHIN ANG MGA LUMANG POLICIES KUNG SILA AY UMIIRAL NA
DROP POLICY IF EXISTS "Allow authenticated merchant logo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to merchant logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow merchants to update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow merchants to delete their own logos" ON storage.objects;

-- 🛠️ HAKBANG B: RE-CREATE AT I-APPLY ANG KUMPLETO AT MATIBAY NA STORAGE PERMISONS

-- 1. POLICY FOR INSERT: Payagan ang authenticated merchants na mag-upload sa 'logos' bucket
CREATE POLICY "Allow authenticated merchant logo uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos' AND (auth.uid() IS NOT NULL));

-- 2. POLICY FOR SELECT: Payagan ang publiko at ang system na basahin/i-list ang laman ng logos bucket
CREATE POLICY "Allow public read access to merchant logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- 3. POLICY FOR UPDATE: Payagan ang merchant na palitan o i-overwrite ang sarili nilang logo
CREATE POLICY "Allow merchants to update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos' AND owner_id::text = auth.uid()::text)
WITH CHECK (bucket_id = 'logos');

-- 4. POLICY FOR DELETE: Payagan ang merchant na burahin ang logo nila kung magpapalit sila
CREATE POLICY "Allow merchants to delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos' AND owner_id::text = auth.uid()::text);

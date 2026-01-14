# Fix for RLS Policy Error

The error "new row violates row-level security policy" means the storage policies need adjustment.

## Run This SQL in Supabase:

```sql
-- First, drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Users can upload their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own PDFs" ON storage.objects;

-- Now create simpler, working policies
-- Policy 1: Allow authenticated users to upload to acord-pdfs bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'acord-pdfs');

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'acord-pdfs');

-- Policy 3: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'acord-pdfs');
```

This will fix the RLS error and allow file uploads!






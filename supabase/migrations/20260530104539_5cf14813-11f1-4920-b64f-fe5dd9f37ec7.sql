
-- Restrict has_role: only invoked from RLS / SECURITY DEFINER context
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, PUBLIC;

-- Drop broad listing policies; public bucket URLs still serve files directly
DROP POLICY IF EXISTS "Public read music" ON storage.objects;
DROP POLICY IF EXISTS "Public read media" ON storage.objects;

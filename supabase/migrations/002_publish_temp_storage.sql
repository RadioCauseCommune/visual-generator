-- Migration 002: Bucket Supabase Storage pour l'hébergement temporaire des images
-- Exécuter dans la console SQL Supabase (section Storage > Policies)
-- OU via l'API Supabase Management

-- Créer le bucket public pour les images temporaires de publication
-- (À exécuter via le dashboard Supabase > Storage ou via l'API Management)

-- Via SQL (si le schéma storage est accessible) :
INSERT INTO storage.buckets (id, name, public)
VALUES ('publish-temp', 'publish-temp', true)
ON CONFLICT (id) DO NOTHING;

-- Politique : les utilisateurs authentifiés peuvent uploader leurs propres images
CREATE POLICY "Authenticated users can upload publish images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'publish-temp');

-- Politique : lecture publique (nécessaire pour que Meta/LinkedIn puisse accéder à l'image)
CREATE POLICY "Public read access for publish images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'publish-temp');

-- Politique : les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Users can delete own publish images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'publish-temp' AND auth.uid()::text = (storage.foldername(name))[1]);

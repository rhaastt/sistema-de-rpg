-- ============================================================
-- Storage: bucket de imagens de campanha (upload .webp)
-- ============================================================
-- Bucket público (a URL da imagem é exibida em <img>), com limite de
-- 2 MB e apenas image/webp. Upload restrito ao próprio usuário via
-- prefixo de pasta = auth.uid().

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('campaign-images', 'campaign-images', true, 2097152, ARRAY['image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (bucket público)
CREATE POLICY "campaign-images: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-images');

-- Upload restrito à pasta do próprio usuário
CREATE POLICY "campaign-images: usuário envia na própria pasta"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atualização/remoção restritas ao dono da pasta
CREATE POLICY "campaign-images: dono atualiza"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'campaign-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "campaign-images: dono remove"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'campaign-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

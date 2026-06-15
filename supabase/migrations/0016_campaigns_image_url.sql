-- Imagem/ilustração da campanha (URL). Opcional; null usa placeholder na UI.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- Fase 4: região de origem do personagem (Compêndio §1)
-- ============================================================
-- Reinos conhecidos: Altária, Kattawood, Leondor, Barioth. As cidades
-- por reino ainda são pendência do Compêndio (§10), então guardamos só
-- o reino como texto, validado na aplicação.

ALTER TABLE characters ADD COLUMN IF NOT EXISTS region TEXT;

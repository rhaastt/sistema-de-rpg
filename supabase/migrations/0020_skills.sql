-- ============================================================
-- Fase 4: perícias (Compêndio §6)
-- ============================================================
-- Perícia = capacidade registrada na ficha. O número é um REQUISITO de
-- atributo (valor mínimo), não um bônus. O sistema não executa efeitos.

CREATE TYPE skill_origin AS ENUM ('racial', 'classe', 'criacao', 'evolucao', 'mestre');

CREATE TABLE skills (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  -- Atributo exigido (chave dos 6) ou NULL quando a perícia não tem requisito
  attribute         TEXT,
  requirement_value INTEGER,
  description       TEXT,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE character_skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id      UUID NOT NULL REFERENCES skills(id),
  origin        skill_origin NOT NULL DEFAULT 'criacao',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT character_skills_unique UNIQUE (character_id, skill_id)
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;

-- Catálogo: leitura para autenticados; escrita só por migrations/seeds.
CREATE POLICY "skills: leitura para autenticados"
  ON skills FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- character_skills: espelha as policies de character_classes.
CREATE POLICY "character_skills: visível para participante da campanha"
  ON character_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id AND is_campaign_member(c.campaign_id)
    )
  );

CREATE POLICY "character_skills: inserção pelo dono ou mestre"
  ON character_skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.owner_id = auth.uid() OR is_campaign_master(c.campaign_id))
        AND NOT c.sheet_locked
    )
  );

CREATE POLICY "character_skills: edição pelo dono ou mestre"
  ON character_skills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.owner_id = auth.uid() OR is_campaign_master(c.campaign_id))
        AND NOT c.sheet_locked
    )
  );

-- ── GRANTs ───────────────────────────────────────────────────
GRANT SELECT ON TABLE public.skills TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.character_skills TO authenticated, service_role;
GRANT DELETE ON TABLE public.character_skills TO service_role;

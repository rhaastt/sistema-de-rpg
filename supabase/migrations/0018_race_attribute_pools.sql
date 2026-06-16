-- ============================================================
-- Fase 4 — passo 1: pontos e modificadores raciais
-- ============================================================
-- Compêndio §2/§4: cada raça concede um pool de Pontos de Atributo
-- (padrão 12; Humano 16) e modificadores fixos por atributo. O valor
-- final de cada atributo = distribuído + bônus_racial + evolução.
--
-- Modelo: pool em coluna inteira; modificadores em JSONB com chaves dos
-- 6 atributos (strength/dexterity/constitution/intelligence/mind/charisma),
-- só os não-zero. O cálculo do valor final fica na aplicação.
-- Passivas raciais permanecem como texto em `description` (interpretadas
-- pelo mestre) até a etapa de perícias estruturar as raciais.

ALTER TABLE races ADD COLUMN IF NOT EXISTS attribute_points INTEGER NOT NULL DEFAULT 12;
ALTER TABLE races ADD COLUMN IF NOT EXISTS attribute_modifiers JSONB NOT NULL DEFAULT '{}'::jsonb;

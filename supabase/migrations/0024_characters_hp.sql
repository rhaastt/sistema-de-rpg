-- ============================================================
-- Fase 4: vida atual do personagem (Compêndio §2)
-- ============================================================
-- vida_máxima = 100 + (Constituição_final × 10)  -> derivada, não armazenada
-- capacidade  = 10 + Força_final                  -> derivada, não armazenada
-- A vida ATUAL é controlada pelo mestre (sem automação de combate) e fica
-- entre 0 e a máxima. Definida na criação como a máxima.

ALTER TABLE characters ADD COLUMN IF NOT EXISTS current_hp INTEGER;

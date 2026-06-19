-- ============================================================
-- 0025: Restrição da classe Bruxa = só sexo feminino
-- ============================================================
-- Regra atual do ruleset (CLAUDE.md §5.5.2; mvp §3.4/§15; compêndio §10):
-- a classe Bruxa só pode ser escolhida por personagens do **sexo feminino**,
-- SEM dependência de raça. A "raça Bruxa" não existe no ruleset.
-- Substitui a regra antiga ("feminino E raça Bruxa") do 0009.

-- 1. Recria a validação sem a checagem de raça (mantém o trigger do 0009).
CREATE OR REPLACE FUNCTION validate_bruxa_class()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_character_sex TEXT;
  v_class_name    TEXT;
BEGIN
  SELECT c.sex INTO v_character_sex
  FROM characters c
  WHERE c.id = NEW.character_id;

  SELECT name INTO v_class_name FROM classes WHERE id = NEW.class_id;

  IF v_class_name = 'Bruxa' AND v_character_sex <> 'female' THEN
    RAISE EXCEPTION 'A classe Bruxa só pode ser escolhida por personagens do sexo feminino';
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Remove a raça Bruxa do catálogo (não existe no ruleset).
--    Guarda de FK: não remove se algum personagem ainda a referencia.
DELETE FROM races r
WHERE r.name = 'Bruxa'
  AND NOT EXISTS (SELECT 1 FROM characters c WHERE c.race_id = r.id);

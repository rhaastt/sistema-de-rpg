-- ============================================================
-- 0009: Adiciona email em profiles + constraint da Bruxa
-- ============================================================

-- 1. Adiciona coluna email ao profiles (para busca por convite)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- Preenche o email de perfis já existentes a partir de auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email = '';

-- Garante unicidade
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles (email);

-- 2. Atualiza o trigger de criação de usuário para incluir o email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- 3. Constraint da Bruxa: só para personagens do sexo feminino E raça Bruxa
CREATE OR REPLACE FUNCTION validate_bruxa_class()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_character_sex TEXT;
  v_race_name     TEXT;
  v_class_name    TEXT;
BEGIN
  SELECT c.sex, r.name
  INTO v_character_sex, v_race_name
  FROM characters c
  JOIN races r ON r.id = c.race_id
  WHERE c.id = NEW.character_id;

  SELECT name INTO v_class_name FROM classes WHERE id = NEW.class_id;

  IF v_class_name = 'Bruxa' THEN
    IF v_character_sex <> 'female' THEN
      RAISE EXCEPTION 'A classe Bruxa só pode ser escolhida por personagens do sexo feminino';
    END IF;
    IF v_race_name <> 'Bruxa' THEN
      RAISE EXCEPTION 'A classe Bruxa só pode ser escolhida por personagens da raça Bruxa';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER character_classes_check_bruxa
  BEFORE INSERT OR UPDATE ON character_classes
  FOR EACH ROW EXECUTE FUNCTION validate_bruxa_class();

-- 4. RLS: perfis consultáveis por e-mail apenas por usuários autenticados
CREATE POLICY "profiles: busca por email para autenticados"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

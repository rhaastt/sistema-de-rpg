CREATE TABLE characters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  image_url       TEXT,
  sex             character_sex NOT NULL,
  age             INTEGER CHECK (age > 0),
  race_id         UUID NOT NULL REFERENCES races(id),
  visual_description TEXT,
  background      TEXT,
  status          character_status NOT NULL DEFAULT 'active',
  sheet_locked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Um personagem por jogador por campanha
  CONSTRAINT characters_one_per_player_per_campaign UNIQUE (campaign_id, owner_id)
);

CREATE TRIGGER characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Multiclasse: duas combinações classe + especialização por personagem
CREATE TABLE character_classes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id      UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  slot              class_slot NOT NULL,
  class_id          UUID NOT NULL REFERENCES classes(id),
  specialization_id UUID NOT NULL REFERENCES specializations(id),
  -- Slot único por personagem
  CONSTRAINT character_classes_unique_slot UNIQUE (character_id, slot)
);

-- Garante que a especialização pertence à classe do mesmo slot (via trigger)
CREATE OR REPLACE FUNCTION validate_specialization_class()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM specializations
    WHERE id = NEW.specialization_id AND class_id = NEW.class_id
  ) THEN
    RAISE EXCEPTION 'A especialização não pertence à classe informada no slot %', NEW.slot;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER character_classes_check_specialization
  BEFORE INSERT OR UPDATE ON character_classes
  FOR EACH ROW EXECUTE FUNCTION validate_specialization_class();

-- Seis atributos do ruleset Celestia
CREATE TABLE character_attributes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
  strength        INTEGER NOT NULL DEFAULT 0,
  dexterity       INTEGER NOT NULL DEFAULT 0,
  constitution    INTEGER NOT NULL DEFAULT 0,
  intelligence    INTEGER NOT NULL DEFAULT 0,
  mind            INTEGER NOT NULL DEFAULT 0,
  charisma        INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER character_attributes_updated_at
  BEFORE UPDATE ON character_attributes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Cria registro de atributos automaticamente ao criar personagem
CREATE OR REPLACE FUNCTION handle_new_character()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO character_attributes (character_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_character_created
  AFTER INSERT ON characters
  FOR EACH ROW EXECUTE FUNCTION handle_new_character();

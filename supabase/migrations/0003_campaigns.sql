CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id),
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description TEXT,
  status      campaign_status NOT NULL DEFAULT 'preparation',
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE campaign_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  role        member_role NOT NULL DEFAULT 'player',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at  TIMESTAMPTZ,
  CONSTRAINT campaign_members_unique_active UNIQUE (campaign_id, user_id)
);

-- Insere o mestre como participante ao criar a campanha
CREATE OR REPLACE FUNCTION handle_new_campaign()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO campaign_members (campaign_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'master');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_campaign_created
  AFTER INSERT ON campaigns
  FOR EACH ROW EXECUTE FUNCTION handle_new_campaign();

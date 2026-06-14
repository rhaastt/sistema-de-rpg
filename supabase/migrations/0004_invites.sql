CREATE TABLE invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  inviter_id   UUID NOT NULL REFERENCES profiles(id),
  invitee_id   UUID NOT NULL REFERENCES profiles(id),
  status       invite_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Impede dois convites pendentes para o mesmo usuário na mesma campanha
  CONSTRAINT invites_unique_pending UNIQUE NULLS NOT DISTINCT (campaign_id, invitee_id, (CASE WHEN status = 'pending' THEN status ELSE NULL END)),
  CONSTRAINT invites_no_self_invite CHECK (inviter_id <> invitee_id)
);

CREATE TRIGGER invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

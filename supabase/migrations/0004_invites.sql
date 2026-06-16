CREATE TABLE invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  inviter_id   UUID NOT NULL REFERENCES profiles(id),
  invitee_id   UUID NOT NULL REFERENCES profiles(id),
  status       invite_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invites_no_self_invite CHECK (inviter_id <> invitee_id)
);

-- Índice parcial: impede dois convites pendentes para o mesmo usuário na mesma campanha.
-- Equivalente ao UNIQUE NULLS NOT DISTINCT mas compatível com PostgreSQL < 15.
CREATE UNIQUE INDEX invites_unique_pending
  ON invites (campaign_id, invitee_id)
  WHERE status = 'pending';

CREATE TRIGGER invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

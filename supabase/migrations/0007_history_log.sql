CREATE TABLE history_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  actor_id     UUID REFERENCES profiles(id),
  event_type   history_event_type NOT NULL,
  -- Metadados estruturados sem proliferar colunas
  metadata     JSONB NOT NULL DEFAULT '{}',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consulta por campanha e tipo de evento
CREATE INDEX history_log_campaign_idx ON history_log (campaign_id, occurred_at DESC);
CREATE INDEX history_log_event_type_idx ON history_log (event_type);

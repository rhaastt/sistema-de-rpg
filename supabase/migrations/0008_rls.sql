-- ============================================================
-- Row Level Security — Fase 1
-- Toda permissão é validada no banco; nunca só no cliente.
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters         ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_classes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE races              ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_log        ENABLE ROW LEVEL SECURITY;

-- ── Funções auxiliares ──────────────────────────────────────

-- Verifica se o usuário autenticado é mestre de uma campanha
CREATE OR REPLACE FUNCTION is_campaign_master(p_campaign_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaigns
    WHERE id = p_campaign_id AND owner_id = auth.uid()
  );
$$;

-- Verifica se o usuário autenticado é participante ativo de uma campanha
CREATE OR REPLACE FUNCTION is_campaign_member(p_campaign_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = p_campaign_id
      AND user_id = auth.uid()
      AND removed_at IS NULL
  );
$$;

-- ── profiles ────────────────────────────────────────────────

CREATE POLICY "profiles: leitura pública"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles: edição pelo próprio usuário"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── campaigns ───────────────────────────────────────────────

CREATE POLICY "campaigns: participantes veem a campanha"
  ON campaigns FOR SELECT
  USING (is_campaign_member(id));

CREATE POLICY "campaigns: mestre cria"
  ON campaigns FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "campaigns: mestre edita"
  ON campaigns FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Exclusão física bloqueada por design (estado archived)
-- Sem política de DELETE.

-- ── campaign_members ────────────────────────────────────────

CREATE POLICY "campaign_members: participantes veem membros"
  ON campaign_members FOR SELECT
  USING (is_campaign_member(campaign_id));

CREATE POLICY "campaign_members: apenas sistema insere"
  ON campaign_members FOR INSERT
  WITH CHECK (false); -- Gerenciado por funções SECURITY DEFINER

CREATE POLICY "campaign_members: mestre remove participante"
  ON campaign_members FOR UPDATE
  USING (is_campaign_master(campaign_id))
  WITH CHECK (is_campaign_master(campaign_id));

-- ── invites ─────────────────────────────────────────────────

CREATE POLICY "invites: mestre vê convites da campanha"
  ON invites FOR SELECT
  USING (is_campaign_master(campaign_id) OR invitee_id = auth.uid());

CREATE POLICY "invites: mestre cria convite"
  ON invites FOR INSERT
  WITH CHECK (is_campaign_master(campaign_id) AND inviter_id = auth.uid());

CREATE POLICY "invites: mestre ou convidado atualiza status"
  ON invites FOR UPDATE
  USING (is_campaign_master(campaign_id) OR invitee_id = auth.uid())
  WITH CHECK (is_campaign_master(campaign_id) OR invitee_id = auth.uid());

-- ── characters ──────────────────────────────────────────────

-- Mestre vê todos; jogador vê o próprio; outros veem apenas dados públicos
-- A visibilidade granular de campos é controlada na camada de aplicação e RLS de subquery
CREATE POLICY "characters: mestre vê todos na campanha"
  ON characters FOR SELECT
  USING (is_campaign_master(campaign_id));

CREATE POLICY "characters: jogador vê o próprio"
  ON characters FOR SELECT
  USING (owner_id = auth.uid() AND is_campaign_member(campaign_id));

CREATE POLICY "characters: participantes veem dados básicos"
  ON characters FOR SELECT
  USING (is_campaign_member(campaign_id));

CREATE POLICY "characters: jogador cria o próprio (ficha não bloqueada)"
  ON characters FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND is_campaign_member(campaign_id)
  );

CREATE POLICY "characters: jogador edita o próprio se ficha desbloqueada"
  ON characters FOR UPDATE
  USING (
    (owner_id = auth.uid() AND NOT sheet_locked AND is_campaign_member(campaign_id))
    OR is_campaign_master(campaign_id)
  )
  WITH CHECK (
    (owner_id = auth.uid() AND NOT sheet_locked AND is_campaign_member(campaign_id))
    OR is_campaign_master(campaign_id)
  );

-- ── character_classes ───────────────────────────────────────

CREATE POLICY "character_classes: visível para participante da campanha"
  ON character_classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id AND is_campaign_member(c.campaign_id)
    )
  );

CREATE POLICY "character_classes: inserção pelo dono ou mestre"
  ON character_classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.owner_id = auth.uid() OR is_campaign_master(c.campaign_id))
        AND NOT c.sheet_locked
    )
  );

CREATE POLICY "character_classes: edição pelo dono ou mestre"
  ON character_classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.owner_id = auth.uid() OR is_campaign_master(c.campaign_id))
        AND NOT c.sheet_locked
    )
  );

-- ── character_attributes ────────────────────────────────────

CREATE POLICY "character_attributes: dono e mestre veem"
  ON character_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.owner_id = auth.uid() OR is_campaign_master(c.campaign_id))
    )
  );

CREATE POLICY "character_attributes: dono edita se desbloqueado ou mestre edita"
  ON character_attributes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (
          (c.owner_id = auth.uid() AND NOT c.sheet_locked)
          OR is_campaign_master(c.campaign_id)
        )
    )
  );

-- ── Catálogos (races, classes, specializations) ─────────────
-- Leitura pública para todos os usuários autenticados.
-- Escrita somente via migrations/seeds.

CREATE POLICY "races: leitura para autenticados"
  ON races FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "classes: leitura para autenticados"
  ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "specializations: leitura para autenticados"
  ON specializations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── history_log ─────────────────────────────────────────────

CREATE POLICY "history_log: participantes veem histórico da campanha"
  ON history_log FOR SELECT
  USING (is_campaign_member(campaign_id));

CREATE POLICY "history_log: apenas sistema insere"
  ON history_log FOR INSERT
  WITH CHECK (false); -- Inserido por funções SECURITY DEFINER

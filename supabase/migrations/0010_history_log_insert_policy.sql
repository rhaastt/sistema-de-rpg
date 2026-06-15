-- ============================================================
-- Fix RLS policies that were blocking correct client operations
-- ============================================================

-- ── campaign_members: permitir entrada via convite aceito ────
-- A política anterior bloqueava TODOS os inserts do cliente.
-- O trigger handle_new_campaign já usa SECURITY DEFINER para
-- adicionar o mestre. Para jogadores, o próprio invitado pode
-- se inserir se houver um convite aceito em seu nome.

DROP POLICY "campaign_members: apenas sistema insere" ON campaign_members;

CREATE POLICY "campaign_members: trigger insere mestre"
  ON campaign_members FOR INSERT
  WITH CHECK (false); -- mestre adicionado por trigger SECURITY DEFINER

CREATE POLICY "campaign_members: jogador entra via convite aceito"
  ON campaign_members FOR INSERT
  WITH CHECK (
    role = 'player'
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM invites i
      WHERE i.campaign_id = campaign_members.campaign_id
        AND i.invitee_id = auth.uid()
        AND i.status = 'accepted'
    )
  );

-- ── history_log: permitir insert pelo próprio ator membro ───
-- A política anterior bloqueava todos os inserts (WITH CHECK (false)).
-- Agora o ator pode registrar eventos de campanhas em que participa.
-- O campo actor_id DEVE ser igual a auth.uid() para impedir falsificações.

DROP POLICY "history_log: apenas sistema insere" ON history_log;

CREATE POLICY "history_log: participante insere evento próprio"
  ON history_log FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND is_campaign_member(campaign_id)
  );

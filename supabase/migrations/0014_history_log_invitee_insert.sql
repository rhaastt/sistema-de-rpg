-- ============================================================
-- Fix: registrar recusa de convite no histórico
-- ============================================================
-- Seção 5.7 do .claude exige registrar convite "recusado". Quem
-- recusa é o convidado, que ainda NÃO é membro da campanha — então
-- a policy anterior (is_campaign_member) bloqueava o insert, e o
-- log best-effort era silenciosamente descartado.
--
-- Adiciona uma policy permitindo que o convidado registre eventos
-- (actor_id = auth.uid()) em campanhas para as quais possui um
-- convite. A leitura do histórico continua restrita a membros, então
-- o evento fica visível apenas para o mestre da campanha.

CREATE POLICY "history_log: convidado registra evento do próprio convite"
  ON history_log FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM invites i
      WHERE i.campaign_id = history_log.campaign_id
        AND i.invitee_id = auth.uid()
    )
  );

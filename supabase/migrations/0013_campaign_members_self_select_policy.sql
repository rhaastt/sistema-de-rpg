-- ============================================================
-- Fix: INSERT ... RETURNING em campaign_members bloqueado por RLS
-- ============================================================
-- Mesmo problema da migration 0012, agora no fluxo de aceitar
-- convite. O repositório usa `insert(...).select()` em addMember,
-- e a única policy de SELECT era `is_campaign_member(campaign_id)`.
--
-- Essa função é STABLE e faz seu próprio SELECT em campaign_members.
-- Durante o RETURNING do INSERT, ela usa o snapshot do statement,
-- que ainda NÃO enxerga a linha sendo inserida pelo mesmo statement.
-- Resultado: is_campaign_member retorna false e o INSERT falha com
-- 42501, mesmo com o WITH CHECK satisfeito (convite aceito + player).
--
-- Solução: permitir que o usuário veja a própria associação direto
-- por user_id, sem depender da função. Também é semanticamente
-- correto — o participante sempre vê o próprio vínculo.

CREATE POLICY "campaign_members: usuário vê a própria associação"
  ON campaign_members FOR SELECT
  USING (user_id = auth.uid());

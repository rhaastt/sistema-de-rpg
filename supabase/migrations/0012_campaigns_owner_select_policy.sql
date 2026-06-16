-- ============================================================
-- Fix: INSERT ... RETURNING em campaigns bloqueado por RLS
-- ============================================================
-- O cliente usa `insert(...).select()`, que exige que a policy
-- de SELECT aprove a linha recém-inserida (cláusula RETURNING).
--
-- A única policy de SELECT era `is_campaign_member(id)`. Essa
-- função é STABLE, então durante o RETURNING ela enxerga o
-- snapshot do statement de INSERT — que ainda NÃO contém a linha
-- de campaign_members criada pelo trigger AFTER INSERT
-- (handle_new_campaign). Resultado: a policy retorna false e o
-- INSERT falha com 42501 "new row violates row-level security
-- policy for table campaigns", mesmo com o WITH CHECK satisfeito.
--
-- Solução: permitir que o dono veja a própria campanha direto
-- por owner_id, sem depender do timing do trigger. Também é
-- semanticamente correto — o mestre sempre vê sua campanha.

CREATE POLICY "campaigns: mestre vê própria campanha"
  ON campaigns FOR SELECT
  USING (owner_id = auth.uid());

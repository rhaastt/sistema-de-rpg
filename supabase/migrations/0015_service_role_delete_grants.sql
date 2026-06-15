-- ============================================================
-- DELETE administrativo restrito ao service_role
-- ============================================================
-- A regra "exclusão física evitada" (seção 10 do .claude) vale para
-- os clientes: anon e authenticated continuam SEM DELETE, e não há
-- policy de DELETE em nenhuma tabela — então a API pública jamais
-- apaga dados.
--
-- O service_role é um papel exclusivamente server-side (a chave nunca
-- vai ao cliente). Conceder DELETE a ele habilita limpeza
-- administrativa e teardown de testes de integração, sem afetar a
-- superfície exposta aos usuários.

GRANT DELETE ON TABLE public.campaigns         TO service_role;
GRANT DELETE ON TABLE public.campaign_members  TO service_role;
GRANT DELETE ON TABLE public.invites           TO service_role;
GRANT DELETE ON TABLE public.characters        TO service_role;
GRANT DELETE ON TABLE public.character_classes TO service_role;
GRANT DELETE ON TABLE public.character_attributes TO service_role;
GRANT DELETE ON TABLE public.history_log       TO service_role;

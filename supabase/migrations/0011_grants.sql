-- Concede privilégios de tabela aos roles do Supabase.
-- RLS e GRANT são camadas independentes: o GRANT permite que o role
-- chegue até a verificação de RLS; as policies controlam quais linhas
-- são acessíveis. Sem o GRANT, o PostgreSQL bloqueia antes mesmo do RLS.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Catálogos (races, classes, specializations): leitura para todos
GRANT SELECT ON TABLE public.races              TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.classes            TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.specializations    TO anon, authenticated, service_role;

-- Profiles: leitura para todos; escrita pelo próprio usuário (via RLS)
GRANT SELECT, UPDATE ON TABLE public.profiles   TO authenticated, service_role;

-- Campanhas e membros
GRANT SELECT, INSERT, UPDATE ON TABLE public.campaigns         TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.campaign_members  TO authenticated, service_role;

-- Convites
GRANT SELECT, INSERT, UPDATE ON TABLE public.invites           TO authenticated, service_role;

-- Personagens
GRANT SELECT, INSERT, UPDATE ON TABLE public.characters            TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.character_classes     TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.character_attributes  TO authenticated, service_role;

-- Histórico (sem UPDATE/DELETE por design)
GRANT SELECT, INSERT ON TABLE public.history_log TO authenticated, service_role;

-- Sequências (necessário para DEFAULT gen_random_uuid() em alguns contextos)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

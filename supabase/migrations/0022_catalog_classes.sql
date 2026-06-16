-- ============================================================
-- Catálogo de referência — promovido de seed para migration
-- ============================================================
-- Dados de referência exigidos pelo app (não dados de teste).
-- Ficam em migration para aplicarem em qualquer ambiente via
-- 'supabase db push' — o push NÃO roda seeds. Idempotente.

-- Seed idempotente de classes e especializações Celestia
-- As especializações são registros vinculados à classe; não enums rígidos.

-- Inserir classes
INSERT INTO classes (name, description) VALUES
  ('Guerreiro',   'Combatente versátil especializado em armas e armaduras.'),
  ('Paladino',    'Guerreiro sagrado que une fé e combate.'),
  ('Arqueiro',    'Especialista em combate à distância com arcos e bestas.'),
  ('Ladino',      'Mestre da furtividade, armadilhas e golpes precisos.'),
  ('Mago',        'Manipulador de magia arcana via estudo e fórmulas.'),
  ('Feiticeiro',  'Conjurador com poder mágico inato.'),
  ('Clérigo',     'Servo divino que canaliza o poder de sua fé.'),
  ('Druida',      'Guardião da natureza com poderes elementais.'),
  ('Atirador',    'Combatente à distância com armas de fogo.'),
  ('Bruxa',       'Conjuradora de magia sombria; restrita a mulheres da raça Bruxa.'),
  ('Lutador',     'Especialista em combate desarmado e artes marciais.'),
  ('Bardo',       'Artista e aventureiro que usa a performance como arma.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Inserir especializações vinculadas às classes
-- Usamos subquery para buscar o class_id pelo nome (idempotente)

-- Guerreiro
WITH cls AS (SELECT id FROM classes WHERE name = 'Guerreiro')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Campeão',       'Especializado em golpes poderosos e resistência.'),
  ('Mestre de Armas','Domina uma ampla variedade de armas marciais.'),
  ('Comandante',    'Lidera aliados com táticas e auras de batalha.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Paladino
WITH cls AS (SELECT id FROM classes WHERE name = 'Paladino')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Juramento da Devoção',  'Paladino clássico da luz e honra.'),
  ('Juramento dos Antigos', 'Protege a natureza e a vida.'),
  ('Juramento da Conquista','Implacável perseguidor do mal.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Arqueiro
WITH cls AS (SELECT id FROM classes WHERE name = 'Arqueiro')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Caçador',       'Rastrea e elimina alvos com precisão.'),
  ('Atirador Veloz','Velocidade de disparo acima da média.'),
  ('Explorador',    'Combina sobrevivência e combate à distância.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Ladino
WITH cls AS (SELECT id FROM classes WHERE name = 'Ladino')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Assassino',     'Especializado em golpes letais e venenos.'),
  ('Ladrão',        'Mestre de arrombamentos, furtos e disfarces.'),
  ('Espião',        'Infiltrador e manipulador de informações.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Mago
WITH cls AS (SELECT id FROM classes WHERE name = 'Mago')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Evocador',      'Especializado em magias de dano elemental.'),
  ('Ilusionista',   'Cria ilusões e engana os sentidos.'),
  ('Necromante',    'Manipula a morte e os mortos-vivos.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Feiticeiro
WITH cls AS (SELECT id FROM classes WHERE name = 'Feiticeiro')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Origem Dracônica','Poder mágico de linhagem dracônica.'),
  ('Alma Selvagem',  'Magia caótica e imprevisível.'),
  ('Toque Divino',   'Feiticeiro tocado por um deus.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Clérigo
WITH cls AS (SELECT id FROM classes WHERE name = 'Clérigo')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Domínio da Vida',  'Especializado em cura e proteção.'),
  ('Domínio da Luz',   'Canal da energia radiante divina.'),
  ('Domínio da Guerra','Campeão divino no campo de batalha.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Druida
WITH cls AS (SELECT id FROM classes WHERE name = 'Druida')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Círculo da Terra', 'Canaliza a magia dos biomas do mundo.'),
  ('Círculo da Lua',   'Especializado em transformação em besta.'),
  ('Círculo das Estrelas','Guia-se pelos astros e constelações.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Atirador
WITH cls AS (SELECT id FROM classes WHERE name = 'Atirador')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Pistoleiro',    'Mestre das armas curtas de fogo.'),
  ('Atirador de Elite','Precisão cirúrgica em longas distâncias.'),
  ('Artilheiro',    'Especialista em armas pesadas e de área.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Bruxa
WITH cls AS (SELECT id FROM classes WHERE name = 'Bruxa')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Pacto das Sombras','Magia sombria e manipulação de medos.'),
  ('Pacto da Natureza','Comunhão com espíritos da floresta.'),
  ('Grande Bruxa',     'Canal direto de um poder ancestral.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Lutador
WITH cls AS (SELECT id FROM classes WHERE name = 'Lutador')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Monge',         'Disciplina e controle do ki interior.'),
  ('Lutador de Rua','Combate bruto sem regras.'),
  ('Gladiador',     'Artista do espetáculo e do combate.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;

-- Bardo
WITH cls AS (SELECT id FROM classes WHERE name = 'Bardo')
INSERT INTO specializations (class_id, name, description)
SELECT cls.id, spec.name, spec.description FROM cls, (VALUES
  ('Colégio do Saber',   'Coleciona conhecimento e segredos.'),
  ('Colégio do Valor',   'Inspira aliados em batalha.'),
  ('Colégio das Espadas','Combina performance com lâminas.')
) AS spec(name, description)
ON CONFLICT (class_id, name) DO UPDATE SET description = EXCLUDED.description;
